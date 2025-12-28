use axum::http::StatusCode;
use chrono::Utc;
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use serde::{Deserialize, Serialize};

use crate::{config::CONFIG, error::{LocalErr, LocalErrKind, LocalResult, MapErrPrint}};

#[derive(Serialize, Deserialize, Debug)]
pub struct S2SJwtClaims {
    exp: usize, // expiration time
    iat: usize, // issued at
}


#[derive(Clone)]
pub struct S2SJwtRepository;
impl S2SJwtRepository {
    pub fn validate_token(&self, token: &str) -> LocalResult<S2SJwtClaims> {
        let key = DecodingKey::from_secret(CONFIG.s2s_jwt_secret.as_bytes());
        match decode::<S2SJwtClaims>(token, &key, &Validation::default()) {
            Ok(decoded) => Ok(decoded.claims),
            Err(_) => Err(LocalErr::new(LocalErrKind::InvalidAccessToken, StatusCode::UNAUTHORIZED))
        }
    }
    
    pub fn generate_token(&self) -> LocalResult<String> {
        let iat = Utc::now();
        let exp = (iat + CONFIG.s2s_jwt_exp_time).timestamp() as usize;

        let claims = S2SJwtClaims {
            exp, 
            iat: iat.timestamp() as usize
        };

        let key = EncodingKey::from_secret(CONFIG.s2s_jwt_secret.as_bytes());        

        encode(&Header::default(), &claims, &key)
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR))
    }
}
