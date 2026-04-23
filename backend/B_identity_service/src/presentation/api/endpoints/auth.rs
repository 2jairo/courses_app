use axum::{
    Router,
    extract::State,
    http::StatusCode,
    routing::{get, post},
};
use axum_extra::extract::CookieJar;
use sea_orm::{ColumnTrait, Condition};

use crate::{
    config::CONFIG, error::{LocalErr, LocalErrKind, LocalResult}, extract::{Authenticated, Json, JsonValidated, ParsedUserAgent, Query, geo_locate::GeoLocated}, models::entity::{notification, user}, presentation::api::dto::auth::{LoginRequestBody, LogoutRequestQuery, RefreshAccessTokenResponse, RegisterRequestBody, UserRequestsResponse, UserSessionResponse}, state::AppState
};

pub fn auth_routes() -> Router<AppState> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/user", get(get_user_profile))
        .route("/refresh", post(refresh_access_token))
        .route("/logout", post(logout))
        .route("/sessions", get(get_user_sessions))
}

#[utoipa::path(post, path = "/api/auth/register", responses((status = 200, body = UserRequestsResponse)))]
pub async fn register(
    State(AppState {
        users_service,
        mut jwt_service,
        ..
    }): State<AppState>,
    ua: ParsedUserAgent,
    GeoLocated(ip_details): GeoLocated,
    JsonValidated(body): JsonValidated<RegisterRequestBody>,
) -> LocalResult<(CookieJar, Json<UserRequestsResponse>)> {
    let exists_cond = Condition::any()
        .add(user::Column::Email.eq(&body.email))
        .add(user::Column::Username.eq(&body.username));

    let exists = users_service.find_one(exists_cond).await?.is_some();

    if exists {
        return Err(LocalErr::new(LocalErrKind::UserAlredyExists,StatusCode::BAD_REQUEST));
    }

    let user = users_service.insert_user(body.try_into()?).await?;

    let (refresh_token, refresh_sess) = jwt_service.generate_refresh_token_from_user(&user, ua, ip_details.clone()).await?;
    let access_token = jwt_service.generate_access_token_from_user(
        &user, 
        refresh_sess.session_version as i64,
        refresh_sess.family_id,
        ip_details.clone()
    ).await?;
    let jar = CookieJar::new().add(refresh_token);

    let resp_body = UserRequestsResponse {
        avatar: user.avatar,
        email: user.email,
        username: user.username,
        token: Some(access_token),
        unread_notifications: 0,
    };

    Ok((jar, Json(resp_body)))
}

#[utoipa::path(post, path = "/api/auth/login", responses((status = 200, body = UserRequestsResponse)))]
pub async fn login(
    State(AppState {
        users_service,
        mut jwt_service,
        ..
    }): State<AppState>,
    ua: ParsedUserAgent,
    GeoLocated(ip_details): GeoLocated,
    JsonValidated(body): JsonValidated<LoginRequestBody>,
) -> LocalResult<(CookieJar, Json<UserRequestsResponse>)> {
    let exists_cond = Condition::any()
        .add(user::Column::Email.eq(&body.credential))
        .add(user::Column::Username.eq(&body.credential));

    let user = users_service
        .find_one(exists_cond)
        .await?
        .ok_or(LocalErr::new(LocalErrKind::NotFound, StatusCode::NOT_FOUND))?;

    user.password_hash.verify_password(&body.password)?;

    let (refresh_token, refresh_sess) = jwt_service.generate_refresh_token_from_user(&user, ua, ip_details.clone()).await?;
    let access_token = jwt_service.generate_access_token_from_user(
        &user, 
        refresh_sess.session_version as i64, 
        refresh_sess.family_id,
        ip_details.clone()
    ).await?;
    let jar = CookieJar::new().add(refresh_token);

    users_service.insert_session_new_location_notification(
        user.id,
        notification::NotificationTypeSessionNewLocationMetadata {
            ip: ip_details.ip.clone(),
            location: format!("{}, {}", &ip_details.city, &ip_details.country),
            ua,
        }
    ).await?;

    let unread_notifications = users_service.count_unread_notifications(user.id).await?;

    let resp_body = UserRequestsResponse {
        avatar: user.avatar,
        email: user.email,
        username: user.username,
        token: Some(access_token),
        unread_notifications,
    };

    Ok((jar, Json(resp_body)))
}

#[utoipa::path(get, path = "/api/auth/user", responses((status = 200, body = UserRequestsResponse)))]
pub async fn get_user_profile(
    State(AppState { users_service, .. }): State<AppState>,
    Authenticated(claims): Authenticated,
) -> LocalResult<Json<UserRequestsResponse>> {
    let user = users_service
        .find_one(Condition::all().add(user::Column::Id.eq(claims.user_id)))
        .await?
        .ok_or(LocalErr::new(LocalErrKind::NotFound, StatusCode::NOT_FOUND))?;

    let unread_notifications = users_service.count_unread_notifications(user.id).await?;

    let resp_body = UserRequestsResponse {
        avatar: user.avatar,
        email: user.email,
        username: user.username,
        token: None,
        unread_notifications,
    };

    Ok(Json(resp_body))
}

#[utoipa::path(post, path = "/api/auth/refresh", responses((status = 200, body = RefreshAccessTokenResponse)))]
pub async fn refresh_access_token(
    State(AppState { mut jwt_service, .. }): State<AppState>,
    ua: ParsedUserAgent,
    GeoLocated(ip_details): GeoLocated,
    jar: CookieJar,
) -> LocalResult<(CookieJar, Json<RefreshAccessTokenResponse>)> {
    let refresh_token = jar
        .get(&CONFIG.jwt_refresh_cookie_name)
        .ok_or(LocalErr::new(
            LocalErrKind::Unauthorized,
            StatusCode::UNAUTHORIZED,
        ))?
        .value();

    let claims = jwt_service.validate_refresh_token(refresh_token, ua).await?;
    let (new_refresh, new_session) = jwt_service.rotate_refresh_token(&claims, ip_details).await?;

    let jar = CookieJar::new().add(new_refresh);

    let new_access = jwt_service.generate_access_token(
        new_session.user_id, 
        new_session.session_version as i64, 
        new_session.family_id, 
        claims.analytics
    ).await?;

    Ok((jar, Json(RefreshAccessTokenResponse { token: new_access })))
}

#[utoipa::path(get, path = "/api/auth/sessions", responses((status = 200, body = Vec<UserSessionResponse>)))]
pub async fn get_user_sessions(
    State(AppState { mut jwt_service, .. }): State<AppState>,
    Authenticated(claims): Authenticated,
) -> LocalResult<Json<Vec<UserSessionResponse>>> {
    let sessions = jwt_service.get_user_sessions(claims.user_id).await?;
    let mut resp = Vec::with_capacity(sessions.len());

    for sess in sessions {
        let is_online = jwt_service.is_online(&sess.family_id).await?;
        resp.push(UserSessionResponse::from_refresh_session(sess, &claims, is_online));
    }

    Ok(Json(resp))
}

#[utoipa::path(post, path = "/api/auth/logout", responses((status = 200)))]
pub async fn logout(
    State(AppState { mut jwt_service, .. }): State<AppState>,
    Query(LogoutRequestQuery{ all_sessions }): Query<LogoutRequestQuery>,
    ua: ParsedUserAgent,
    jar: CookieJar,
) -> LocalResult<CookieJar> {
    let refresh_token = jar
        .get(&CONFIG.jwt_refresh_cookie_name)
        .ok_or(LocalErr::new(
            LocalErrKind::Unauthorized,
            StatusCode::UNAUTHORIZED,
        ))?
        .value();

    let claims = jwt_service.validate_refresh_token(refresh_token, ua).await?;

    let expired = match all_sessions {
        true => jwt_service.logout_all_sessions(claims.user_id).await?,
        false => jwt_service.logout_current_session(&claims.family_id).await?
    };
    Ok(CookieJar::new().add(expired))
}
