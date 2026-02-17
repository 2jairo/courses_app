use axum::{Json, Router, routing::post};

use crate::{error::LocalResult, extract::{Authenticated, S2SAuthenticated}, routes::dto::auth_internal::AuthenticateAccessTokenResponse, state::AppState};

pub fn auth_internal_routes() -> Router<AppState> {
    Router::new()
        .route("/claims", post(authenticate_client_access_token))
}

#[utoipa::path(post, path = "/internal/auth/claims", responses((status = 200, body = AuthenticateAccessTokenResponse)))]
pub async fn authenticate_client_access_token(
    _: S2SAuthenticated,
    Authenticated(claims): Authenticated
) -> LocalResult<Json<AuthenticateAccessTokenResponse>> {
    Ok(Json(AuthenticateAccessTokenResponse {
        user_id: claims.user_id,
        version: claims.version,
        analytics: claims.analytics,
    }))
}