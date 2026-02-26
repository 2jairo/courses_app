use chrono::Utc;
use sea_orm::ActiveValue::Set;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use validator::Validate;

use crate::{error::LocalErr, models::{entity::{refresh_session::{self, BrowserType, DeviceType, OperatingSystem}, user}, entitycommon::password::Password}, utils::client_jwt::ClientJwtClaims};

fn validate_min_age(birth_date: &chrono::DateTime<Utc>) -> Result<(), validator::ValidationError> {
    let now = Utc::now();
    let age = now.signed_duration_since(*birth_date);
    let min_age_days = chrono::Duration::days(3 * 365);
    
    if age < min_age_days {
        return Err(validator::ValidationError::new("min_age"));
    }
    Ok(())
}

#[derive(Deserialize, ToSchema, Validate)]
pub struct RegisterRequestBody {
    #[validate(length(max = 50, min = 3))]
    pub username: String,
    #[validate(length(max = 100, min = 3), email)]
    pub email: String,
    #[validate(length(max = 100, min = 3))]
    pub password: String,
    #[validate(custom(function = "validate_min_age"))]
    pub birth_date: chrono::DateTime<Utc>,
    pub sex: user::UserSex,
}

impl TryInto<user::ActiveModel> for RegisterRequestBody {
    type Error = LocalErr;

    fn try_into(self) -> Result<user::ActiveModel, Self::Error> {
        Ok(user::ActiveModel {
            username: Set(self.username),
            email: Set(self.email),
            password_hash: Set(Password(self.password).hash_password()?),
            birth_date: Set(self.birth_date.date_naive()),
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

#[derive(Deserialize, Serialize, ToSchema, Validate, Debug)]
pub struct LogoutRequestQuery {
    pub all_sessions: bool
}

#[derive(Serialize, ToSchema)]
pub struct UserSessionResponse {
    pub id: i64,
    pub device: DeviceType,
    pub os: OperatingSystem,
    pub browser: BrowserType,
    pub created_at: chrono::DateTime<Utc>,
    pub updated_at: chrono::DateTime<Utc>,
    pub is_current: bool,
    pub is_online: bool
}

impl UserSessionResponse {
    pub fn from_refresh_session(sess: refresh_session::Model, claims: &ClientJwtClaims, is_online: bool) -> Self {
        UserSessionResponse {
            id: sess.id,
            device: sess.device,
            os: sess.os,
            browser: sess.browser,
            created_at: sess.created_at.with_timezone(&chrono::Utc),
            updated_at: sess.updated_at.with_timezone(&chrono::Utc),
            is_current: sess.family_id == claims.family_id,
            is_online,
        } 
    }
}