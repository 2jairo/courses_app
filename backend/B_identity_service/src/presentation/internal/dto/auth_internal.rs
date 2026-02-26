use serde::Serialize;
use utoipa::ToSchema;

use crate::utils::client_jwt::ClientJwtAnalytics;

#[derive(Serialize, ToSchema)]
pub struct AuthenticateAccessTokenResponse {
    pub user_id: i64,
    pub session_version: i64,
    pub family_id: String,
    pub analytics: ClientJwtAnalytics
}