use serde::Serialize;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::utils::client_jwt::ClientJwtAnalytics;

#[derive(Serialize, ToSchema)]
pub struct AuthenticateAccessTokenResponse {
    pub user_id: i64,
    pub version: Uuid,
    pub analytics: ClientJwtAnalytics
}