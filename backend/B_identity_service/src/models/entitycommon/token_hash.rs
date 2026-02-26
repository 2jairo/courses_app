use axum::http::StatusCode;
use sea_orm::{DeriveValueType};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::error::{LocalErr, LocalErrKind, LocalResult};


#[derive(Debug, Clone, Serialize, Deserialize, DeriveValueType, PartialEq, Eq)]
pub struct TokenHash(pub String);


impl TokenHash {
    pub fn new(s: &str) -> Self {
        Self(hash(s))
    }

    pub fn compare(&self, token: &str) -> LocalResult<()> {
        let rhs = hash(token);
        
        match rhs == self.0 {
            true => Ok(()),
            false => Err(LocalErr::new(LocalErrKind::Unauthorized, StatusCode::UNAUTHORIZED))
        }
    }
}

fn hash(s: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(s);
    let result = hasher.finalize();
    
    format!("{:x}", result)
}