use axum::{Router, extract::State, http::StatusCode, routing::{get, post}};
use axum_extra::extract::CookieJar;
use sea_orm::{ColumnTrait, Condition};

use crate::{config::CONFIG, error::{LocalErr, LocalErrKind, LocalResult}, extract::{Json, UserId}, models::entity::user, routes::dto::auth::{LoginRequestBody, RefreshAccessTokenResponse, RegisterRequestBody, UserRequestsResponse}, state::AppState};

pub fn auth_routes() -> Router<AppState> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/user", get(get_user_profile))
        .route("/refresh", post(refresh_access_token))
}

pub async fn register(
    State(AppState { users_service, jwt_service , .. }): State<AppState>,
    Json(body): Json<RegisterRequestBody>
) -> LocalResult<(CookieJar, Json<UserRequestsResponse>)> {
    let exists_cond = Condition::any()
        .add(user::Column::Email.eq(&body.email.0))
        .add(user::Column::Username.eq(&body.username.0));

    let exists = users_service.get_user_by(exists_cond)
        .await?
        .is_some();

    if exists {
        return Err(LocalErr::new(LocalErrKind::UserAlredyExists, StatusCode::BAD_REQUEST))
    }
    
    let user = users_service.insert_user(body.try_into()?).await?;

    let access_token = jwt_service.generate_access_token(user.id, user.version)?;
    let refresh_token = jwt_service.generate_refresh_token(user.id, user.version)?;
    let jar = CookieJar::new().add(refresh_token);

    let resp_body = UserRequestsResponse {
        avatar: user.avatar,
        email: user.email,
        username: user.username,
        token: Some(access_token)
    };

    Ok((jar, Json(resp_body)))
}


pub async fn login(
    State(AppState { users_service, jwt_service , .. }): State<AppState>,
    Json(body): Json<LoginRequestBody>,
) -> LocalResult<(CookieJar, Json<UserRequestsResponse>)> {
    let exists_cond = Condition::any()
        .add(user::Column::Email.eq(&body.credential.0))
        .add(user::Column::Username.eq(&body.credential.0));

    let user = users_service.get_user_by(exists_cond)
        .await?
        .ok_or(LocalErr::new(LocalErrKind::NotFound, StatusCode::NOT_FOUND))?;

    user.password_hash.verify_password(&body.password.0)?;

    let access_token = jwt_service.generate_access_token(user.id, user.version)?;
    let refresh_token = jwt_service.generate_refresh_token(user.id, user.version)?;
    let jar = CookieJar::new().add(refresh_token);

    let resp_body = UserRequestsResponse {
        avatar: user.avatar,
        email: user.email,
        username: user.username,
        token: Some(access_token)
    };

    Ok((jar, Json(resp_body)))
}

pub async fn get_user_profile(
    State(AppState { users_service, .. }): State<AppState>,
    UserId(user_id): UserId
) -> LocalResult<Json<UserRequestsResponse>> {
    let user = users_service.get_user_by(Condition::all().add(user::Column::Id.eq(user_id)))
        .await?
        .ok_or(LocalErr::new(LocalErrKind::NotFound, StatusCode::NOT_FOUND))?;

    let resp_body = UserRequestsResponse {
        avatar: user.avatar,
        email: user.email,
        username: user.username,
        token: None
    };

    Ok(Json(resp_body))
}

pub async fn refresh_access_token(
    State(AppState { jwt_service, .. }): State<AppState>,
    jar: CookieJar,
) -> LocalResult<Json<RefreshAccessTokenResponse>> {
    let refresh_token = jar.get(&CONFIG.jwt_refresh_cookie_name)
        .ok_or(LocalErr::new(LocalErrKind::Unauthorized, StatusCode::UNAUTHORIZED))?
        .value();
        
    let claims = jwt_service.validate_refresh_token(refresh_token)?;
    let new_access = jwt_service.generate_access_token(claims.user_id, claims.version)?;
    Ok(Json(RefreshAccessTokenResponse { token: new_access }))
}