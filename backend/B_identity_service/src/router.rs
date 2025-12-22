use axum::{Router, routing::get};

use crate::{routes::endpoints::auth::auth_routes, state::AppState};

pub fn api_routes() -> Router<AppState> {
    Router::new()
        .route("/api/ping", get(async || { "pong" }))
        .nest("/api/auth", auth_routes())
}