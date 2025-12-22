use axum::{extract::FromRequestParts, http::{StatusCode, header::AUTHORIZATION}};
use crate::{error::{LocalErr, LocalErrKind, MapErrPrint}, state::AppState};

#[derive(Debug)]
pub struct UserId(pub uuid::Uuid);

impl FromRequestParts<AppState> for UserId {
    type Rejection = LocalErr;

    async fn from_request_parts(parts: &mut axum::http::request::Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let token = match parts.headers.get(AUTHORIZATION) {
            Some(t) => {
                let t = t.to_str().map_err_print(|_| LocalErr::new(LocalErrKind::Unauthorized, StatusCode::UNAUTHORIZED))?;
                if !t.starts_with("Bearer ") {
                    return Err(LocalErr::new(LocalErrKind::Unauthorized, StatusCode::UNAUTHORIZED));
                }
                &t["Bearer ".len()..] // Strip the "Bearer " prefix
            },
            None => return Err(LocalErr::new(LocalErrKind::Unauthorized, StatusCode::UNAUTHORIZED))
        };

        let claims = state.jwt_service.validate_access_token(token)?;
        Ok(Self(claims.user_id))
    }
}

#[derive(Debug)]
pub struct OptionalUserId(pub Option<uuid::Uuid>);

impl FromRequestParts<AppState> for OptionalUserId {
    type Rejection = LocalErr;

    async fn from_request_parts(parts: &mut axum::http::request::Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let token = parts.headers.get(AUTHORIZATION)
            .and_then(|t| t.to_str().ok())
            .filter(|t| t.starts_with("Bearer "));

        if let Some(t) = token {
            let token_without_prefix = &t["Bearer ".len()..]; // Strip the "Bearer " prefix
            
            match state.jwt_service.validate_access_token(token_without_prefix) {
                Ok(claims) => Ok(Self(Some(claims.user_id))),
                Err(_) => Ok(Self(None))
            }            
        } else {
            Ok(Self(None))
        }
    }
}