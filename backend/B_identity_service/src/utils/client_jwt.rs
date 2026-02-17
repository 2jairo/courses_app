use axum::http::StatusCode;
use axum_extra::extract::cookie::{Cookie, SameSite};
use chrono::Utc;
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use utoipa::ToSchema;

use crate::{config::CONFIG, error::{LocalErr, LocalErrKind, LocalResult, MapErrPrint}, models::entity::user::{self, UserSex}};

#[derive(Serialize, Deserialize, Debug)]
pub struct ClientJwtClaims {
    exp: usize, // expiration time
    iat: usize, // issued at

    pub user_id: i64,
    pub version: uuid::Uuid, // user version (for password/mail changes)
    pub analytics: ClientJwtAnalytics   
}

#[derive(Deserialize, Serialize, Clone, Copy, Default, Debug, ToSchema)]
pub struct ClientJwtAnalytics {
    pub sex: UserSex,
    pub birth_date: chrono::DateTime<Utc>,
}



#[derive(Clone)]
pub struct ClientJwtRepository;
impl ClientJwtRepository {
    pub fn validate_access_token(&self, token: &str) -> LocalResult<ClientJwtClaims> {
        let key = DecodingKey::from_secret(CONFIG.jwt_access_secret.as_bytes());
        match decode::<ClientJwtClaims>(token, &key, &Validation::default()) {
            Ok(decoded) => Ok(decoded.claims),
            Err(_) => Err(LocalErr::new(LocalErrKind::InvalidAccessToken, StatusCode::UNAUTHORIZED))
        }
    }
    
    pub fn validate_refresh_token(&self, token: &str) -> LocalResult<ClientJwtClaims> {
        let key = DecodingKey::from_secret(CONFIG.jwt_refresh_secret.as_bytes());
        match decode::<ClientJwtClaims>(token, &key, &Validation::default()) {
            Ok(decoded) => Ok(decoded.claims),
            Err(_) => Err(LocalErr::new(LocalErrKind::InvalidRefreshToken, StatusCode::UNAUTHORIZED))
        }
    }

    pub fn generate_access_token_from_user(&self, user: &user::Model) -> LocalResult<String> {
        self.generate_access_token(user.id, user.version, ClientJwtAnalytics { 
            sex: user.sex,
            birth_date: user.birth_date.and_hms_opt(0, 0, 0).unwrap().and_utc() 
        })
    }

    pub fn generate_access_token(&self, user_id: i64, version: uuid::Uuid, analytics: ClientJwtAnalytics) -> LocalResult<String> {
        let iat = Utc::now();
        let exp = (iat + CONFIG.jwt_access_exp_time).timestamp() as usize;

        let claims = ClientJwtClaims {
            exp, 
            iat: iat.timestamp() as usize,
            user_id,
            version,
            analytics
        };

        let key = EncodingKey::from_secret(CONFIG.jwt_access_secret.as_bytes());        

        encode(&Header::default(), &claims, &key)
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR))
    }

    pub fn delete_refresh_token(&self) -> Cookie<'static> {
        Cookie::build((CONFIG.jwt_refresh_cookie_name.clone(), ""))
            .http_only(true)
            .expires(OffsetDateTime::UNIX_EPOCH)
            .path("/")
            .domain(CONFIG.jwt_domain.clone())
            .secure(true)
            .same_site(SameSite::Lax)
            .build()
    }

    pub fn generate_refresh_token_from_user(&self, user: &user::Model) ->  LocalResult<Cookie<'static>> {
        self.generate_refresh_token(user.id, user.version, ClientJwtAnalytics { 
            sex: user.sex, 
            birth_date: user.birth_date.and_hms_opt(0, 0, 0).unwrap().and_utc() 
        })
    }

    pub fn generate_refresh_token(&self, user_id: i64, version: uuid::Uuid, analytics: ClientJwtAnalytics) -> LocalResult<Cookie<'static>> {
        let iat = Utc::now();
        let exp = (iat + CONFIG.jwt_refresh_exp_time).timestamp() as usize;

        let claims = ClientJwtClaims {
            exp, 
            iat: iat.timestamp() as usize,
            user_id,
            version,
            analytics
        };

        let key = EncodingKey::from_secret(CONFIG.jwt_refresh_secret.as_bytes());
        let token = encode(&Header::default(), &claims, &key)
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR))?;

        let cookie = Cookie::build((CONFIG.jwt_refresh_cookie_name.clone(), token))
            .http_only(true)
            .expires(OffsetDateTime::now_utc() + time::Duration::days(CONFIG.jwt_refresh_exp_time.num_days()))
            .path("/")
            .domain(CONFIG.jwt_domain.clone())
            .secure(true)
            .same_site(SameSite::Lax)
            .build();

        Ok(cookie)
    }
}
