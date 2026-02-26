use axum::http::StatusCode;
use bcrypt::{hash, verify};
use sea_orm::{DeriveValueType};
use serde::{Deserialize, Serialize};

use crate::error::{LocalErr, LocalErrKind, LocalResult, MapErrPrint};


#[derive(Debug, Clone, Serialize, Deserialize, DeriveValueType, PartialEq, Eq)]
pub struct Password(pub String);

impl Password {
    pub fn hash_password(self) -> LocalResult<Self> {
        hash(self.0, 10)
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR))
            .map(|hashed| Self(hashed))
    }

    pub fn verify_password(&self, rhs: &String) -> LocalResult<()> {
        let result = verify(&rhs, &self.0)
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR))?;

        match result {
            true => Ok(()),
            false => Err(LocalErr::new(LocalErrKind::Unauthorized, StatusCode::UNAUTHORIZED))
        }
    }
}