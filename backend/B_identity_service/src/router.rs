use axum::{Router, routing::get};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::{openapi::ApiDocs, routes::endpoints::auth::auth_routes, state::AppState};

pub fn api_routes() -> Router<AppState> {
    Router::new()
        .route("/api/ping", get(async || { "pong" }))
        .nest("/api/auth", auth_routes())
}

pub fn swagger_routes() -> Router<AppState> {
    Router::new()
        .merge(SwaggerUi::new("/docs").url("/docs/openapi.json", ApiDocs::openapi()))       
}