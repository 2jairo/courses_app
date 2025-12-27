use sea_orm::ActiveValue::Set;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::{error::LocalErr, models::entity::{common::Password, user}, routes::dto::common::StringWithLimit};

#[derive(Deserialize, ToSchema)]
pub struct RegisterRequestBody {
    pub username: StringWithLimit<50>,
    pub email: StringWithLimit<100>,
    pub password: StringWithLimit<100>,
    pub birth_date: chrono::NaiveDate,
    pub sex: user::UserSex
}

impl TryInto<user::ActiveModel> for RegisterRequestBody {
    type Error = LocalErr;

    fn try_into(self) -> Result<user::ActiveModel, Self::Error> {
        Ok(user::ActiveModel {
            username: Set(self.username.0),
            email: Set(self.email.0),
            password_hash: Set(Password(self.password.0).hash_password()?),
            birth_date: Set(self.birth_date),
            sex: Set(self.sex),
            ..Default::default()
        })
    }
}


#[derive(Deserialize, ToSchema)]
pub struct LoginRequestBody {
    pub credential: StringWithLimit<100>,
    pub password: StringWithLimit<100>
}


#[derive(Serialize, ToSchema)]
pub struct UserRequestsResponse {
    pub username: String,
    pub email: String,
    pub avatar: Option<String>,
    pub token: Option<String>,
}


#[derive(Serialize, ToSchema)]
pub struct RefreshAccessTokenResponse {
    pub token: String
}