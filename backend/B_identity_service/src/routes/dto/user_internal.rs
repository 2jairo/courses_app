use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use validator::Validate;

use crate::models::entity::{common::Password, user::{self, UserSex}};



#[derive(Deserialize, ToSchema, Validate)]
pub struct GetUserInfoRequest {
    pub username: Option<String>,
    pub email: Option<String>,
    pub id: Option<i64>
}

#[derive(Serialize)]
pub struct GetUserInfoResponse {
    pub id: i64,
    pub created_at: DateTimeWithTimeZone,
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub version: uuid::Uuid,
    pub email: String,
    pub username: String,
    pub password_hash: Password,
    pub avatar: Option<String>,
    pub banner: Option<String>,
    pub birth_date: chrono::NaiveDate,
    pub sex: UserSex
}
impl From<user::Model> for GetUserInfoResponse {
    fn from(value: user::Model) -> Self {
        Self {
            id: value.id,
            created_at: value.created_at,
            deleted_at: value.deleted_at,
            version: value.version,
            email: value.email,
            username: value.username,
            password_hash: value.password_hash,
            avatar: value.avatar,
            banner: value.banner,
            birth_date: value.birth_date,
            sex: value.sex,
        }
    }
}