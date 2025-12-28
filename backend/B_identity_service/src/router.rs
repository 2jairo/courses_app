use axum::{Router, http::{Method, StatusCode, Uri}, routing::get};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::{error::{LocalErr, LocalErrKind, LocalResult}, openapi::ApiDocs, routes::endpoints::{auth::auth_routes, auth_internal::auth_internal_routes}, state::AppState};

// utils/client_jwt.rs
pub fn api_routes() -> Router<AppState> {
    Router::new()
        .route("/ping", get(async || { "pong" }))
        .nest("/auth", auth_routes())
}

// utils/s2s_jwt.rs
pub fn internal_routes() -> Router<AppState> {
    Router::new()
        .nest("/auth", auth_internal_routes())
}

pub fn swagger_routes() -> Router<AppState> {
    Router::new()
        .merge(SwaggerUi::new("/docs").url("/docs/openapi.json", ApiDocs::openapi()))       
}

pub async fn fallback_route(
    uri: Uri,
    method: Method
) -> LocalResult<()> {
    Err(LocalErr::new(LocalErrKind::NotFound, StatusCode::NOT_FOUND)
        .with_msg(format!("No route fonud for {} {}", method, uri)))
}