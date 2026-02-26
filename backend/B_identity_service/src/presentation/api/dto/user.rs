use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use validator::Validate;

use crate::models::entity::user;


#[derive(Deserialize, ToSchema, Validate)]
pub struct GetUserByPrefixRequestQuery {
    #[validate(length(max = 100, min = 3))]
    pub value: String
}


#[derive(Serialize, ToSchema)]
pub struct GetUserByPrefixResponse {
    pub username: String,
    pub avatar: Option<String>
    // pub email: String,
    // pub id: i64
}
impl From<user::Model> for GetUserByPrefixResponse {
    fn from(value: user::Model) -> Self {
        Self {
            username: value.username,
            avatar: value.avatar
            // email: value.email,
            // id: value.id
        }
    }
}