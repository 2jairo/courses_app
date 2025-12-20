use axum::Router;
use tokio::net::TcpListener;

use crate::{config::CONFIG, state::AppState};

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


#[tokio::main]
async fn main() {
    let env_file = if cfg!(debug_assertions) {
        ".env.development"
    } else {
        ".env.production"
    };
    dotenv::from_filename(env_file).ok();

    let app_state = AppState::new()
        .await
        .expect("Failed to initialize app state");

    let app = Router::new()
        .merge(router::api_routes())
        .with_state(app_state.clone())
        .layer(cors::cors())
        .into_make_service();
    
    let listener = TcpListener::bind(CONFIG.socket.to_string())
        .await
        .unwrap_or_else(|e| panic!("Failed to bind to {}: {}", CONFIG.socket, e));

    println!("listening on http://{}", CONFIG.socket);

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .expect("Server error during shutdown");

    app_state.close()
        .await
        .expect("Failed to close app state")
}

async fn shutdown_signal() {
    let _ = tokio::signal::ctrl_c().await;
    println!("Ctrl-C received, gracefully shutting down");
}
