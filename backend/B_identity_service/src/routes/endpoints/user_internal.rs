use axum::{Json, Router, extract::State, http::StatusCode, routing::get};
use sea_orm::{ColumnTrait, Condition};

use crate::{error::{LocalErr, LocalErrKind, LocalResult}, extract::{Query, S2SAuthenticated}, models::entity::user, routes::dto::{auth_internal::AuthenticateAccessTokenResponse, user_internal::{GetUserInfoRequest, GetUserInfoResponse}}, state::AppState};

pub fn user_internal_routes() -> Router<AppState> {
    Router::new()
        .route("/info", get(get_user_info))
}

#[utoipa::path(post, path = "/internal/user/info", responses((status = 200, body = AuthenticateAccessTokenResponse)))]
pub async fn get_user_info(
    State(AppState { users_service, .. }): State<AppState>,
    _: S2SAuthenticated,
    Query(query): Query<GetUserInfoRequest>
) -> LocalResult<Json<GetUserInfoResponse>> {
    let mut filters = Condition::all();

    if let Some(username) = query.username {
        filters = filters.add(user::Column::Username.eq(username))
    }
    if let Some(email) = query.email {
        filters = filters.add(user::Column::Email.eq(email))
    }
    if let Some(id) = query.id {
        filters = filters.add(user::Column::Id.eq(id))
    }

    match users_service.find_one(filters).await? {
        Some(user) => Ok(Json(GetUserInfoResponse::from(user))),
        None => Err(LocalErr::new(LocalErrKind::NotFound, StatusCode::NOT_FOUND))
    }    
}