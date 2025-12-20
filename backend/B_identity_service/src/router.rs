use axum::{Router, routing::get};

use crate::state::AppState;

pub fn api_routes() -> Router<AppState> {
    Router::new()
        .route("/api/ping", get(async || { "pong" }))
}