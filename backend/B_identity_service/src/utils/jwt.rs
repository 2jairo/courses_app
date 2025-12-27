use axum::http::StatusCode;
use axum_extra::extract::cookie::{Cookie, SameSite};
use chrono::Utc;
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

use crate::{config::CONFIG, error::{LocalErr, LocalErrKind, LocalResult, MapErrPrint}};

#[derive(Serialize, Deserialize)]
pub struct JwtClaims {
    exp: usize, // expiration time
    iat: usize, // issued at

    pub user_id: uuid::Uuid,
    pub version: uuid::Uuid, // user version (for password/mail changes)
}


#[derive(Clone)]
pub struct JwtRepository;
impl JwtRepository {
    pub fn validate_access_token(&self, token: &str) -> LocalResult<JwtClaims> {
        let key = DecodingKey::from_secret(CONFIG.jwt_access_secret.as_bytes());
        match decode::<JwtClaims>(token, &key, &Validation::default()) {
            Ok(decoded) => Ok(decoded.claims),
            Err(_) => Err(LocalErr::new(LocalErrKind::InvalidAccessToken, StatusCode::UNAUTHORIZED))
        }
    }
    
    pub fn validate_refresh_token(&self, token: &str) -> LocalResult<JwtClaims> {
        let key = DecodingKey::from_secret(CONFIG.jwt_refresh_secret.as_bytes());
        match decode::<JwtClaims>(token, &key, &Validation::default()) {
            Ok(decoded) => Ok(decoded.claims),
            Err(_) => Err(LocalErr::new(LocalErrKind::InvalidRefreshToken, StatusCode::UNAUTHORIZED))
        }
    }

    pub fn generate_access_token(&self, user_id: uuid::Uuid, version: uuid::Uuid) -> LocalResult<String> {
        let iat = Utc::now();
        let exp = (iat + CONFIG.jwt_access_exp_time).timestamp() as usize;

        let claims = JwtClaims {
            exp, 
            iat: iat.timestamp() as usize,
            user_id,
            version
        };

        let key = EncodingKey::from_secret(CONFIG.jwt_access_secret.as_bytes());        

        encode(&Header::default(), &claims, &key)
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR))
    }

    pub fn generate_refresh_token(&self, user_id: uuid::Uuid, version: uuid::Uuid) -> LocalResult<Cookie<'static>> {
        let iat = Utc::now();
        let exp = (iat + CONFIG.jwt_refresh_exp_time).timestamp() as usize;

        let claims = JwtClaims {
            exp, 
            iat: iat.timestamp() as usize,
            user_id,
            version,
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
            .same_site(SameSite::None)
            .build();

        Ok(cookie)
    }
}
