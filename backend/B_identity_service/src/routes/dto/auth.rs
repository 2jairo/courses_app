use sea_orm::ActiveValue::Set;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use validator::Validate;

use crate::{error::LocalErr, models::entity::{common::Password, user}};

#[derive(Deserialize, ToSchema, Validate)]
pub struct RegisterRequestBody {
    #[validate(length(max = 50, min = 3))]
    pub username: String,
    #[validate(length(max = 100), email)]
    pub email: String,
    #[validate(length(max = 100, min = 3))]
    pub password: String,
    pub birth_date: chrono::NaiveDate,
    pub sex: user::UserSex,
}

impl TryInto<user::ActiveModel> for RegisterRequestBody {
    type Error = LocalErr;

    fn try_into(self) -> Result<user::ActiveModel, Self::Error> {
        Ok(user::ActiveModel {
            username: Set(self.username),
            email: Set(self.email),
            password_hash: Set(Password(self.password).hash_password()?),
            birth_date: Set(self.birth_date),
            sex: Set(self.sex),
            ..Default::default()
        })
    }
}


#[derive(Deserialize, Serialize, ToSchema, Validate, Debug)]
pub struct LoginRequestBody {
    #[validate(length(max = 100, min = 3))]
    pub credential: String,
    #[validate(length(max = 100, min = 3))]
    pub password: String,
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