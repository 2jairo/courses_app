use serde::Serialize;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Serialize, ToSchema)]
pub struct AuthenticateAccessTokenResponse {
    pub user_id: i64,
    pub version: Uuid
}