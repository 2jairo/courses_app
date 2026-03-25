use axum::{Router, extract::State, routing::get};
use sea_orm::{ColumnTrait, Condition};

use crate::{
    error::LocalResult,
    extract::{Authenticated, Json, Query},
    models::entity::user,
    presentation::api::dto::user::{GetUserByPrefixRequestQuery, GetUserByPrefixResponse},
    state::AppState,
};

pub fn user_routes() -> Router<AppState> {
    Router::new()
        .route("/prefix", get(get_users_by_prefix))
}

#[utoipa::path(post, path = "/api/user/prefix", responses((status = 200, body = Vec<GetUserByPrefixResponse>)))]
pub async fn get_users_by_prefix(
    State(AppState { users_service, .. }): State<AppState>,
    Authenticated(_a): Authenticated,
    Query(query): Query<GetUserByPrefixRequestQuery>,
) -> LocalResult<Json<Vec<GetUserByPrefixResponse>>> {
    let prefix_cond = Condition::any()
        .add(user::Column::Username.like(format!("{}%", query.value)));

    let resp = users_service
        .find(prefix_cond)
        .await?
        .into_iter()
        .map(|resp| resp.into())
        .collect::<Vec<_>>();

    Ok(Json(resp))
}
