use axum::Router;
use tokio::net::TcpListener;
use tower_http::compression::CompressionLayer;

use crate::{config::CONFIG, state::{AppState, DatabasesConnection}};

mod config;
mod cors;
mod router;
mod error;
mod state;

mod db;
mod models;
mod utils;
mod extract;
mod routes;
mod openapi;

#[tokio::main]
async fn main() {
    let env_file = if cfg!(debug_assertions) {
        ".env.development"
    } else {
        ".env.production"
    };
    dotenv::from_filename(env_file).ok();

    let dbs = DatabasesConnection::new()
        .await
        .expect("Failed to initialize app state");

    let app_state = AppState::new(dbs.clone())
        .await
        .expect("Failed to initialize app state");

    let app = Router::new()
        .nest("/api", router::api_routes())
        .nest("/internal", router::internal_routes())
        .merge(router::swagger_routes()) //   /docs
        .with_state(app_state.clone())
        .layer(cors::cors())
        .layer(CompressionLayer::new())
        .fallback(router::fallback_route)
        .method_not_allowed_fallback(router::fallback_method_not_allowed)
        .into_make_service();
    
    let listener = TcpListener::bind(CONFIG.socket.to_string())
        .await
        .unwrap_or_else(|e| panic!("Failed to bind to {}: {}", CONFIG.socket, e));

    println!("listening on http://{}", CONFIG.socket);

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .expect("Server error during shutdown");

    dbs.close()
        .await
        .expect("Failed to close app state")
}

async fn shutdown_signal() {
    let _ = tokio::signal::ctrl_c().await;
    println!("Ctrl-C received, gracefully shutting down");
}
