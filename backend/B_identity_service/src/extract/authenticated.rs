use axum::{extract::FromRequestParts, http::{StatusCode, header::{AUTHORIZATION, AsHeaderName}}};
use crate::{error::{LocalErr, LocalErrKind, LocalResult, MapErrPrint}, state::AppState, utils::{client_jwt::ClientJwtClaims, s2s_jwt::S2SJwtClaims}};

#[derive(Debug)]
pub struct Authenticated(pub ClientJwtClaims);

impl FromRequestParts<AppState> for Authenticated {
    type Rejection = LocalErr;

    async fn from_request_parts(parts: &mut axum::http::request::Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let token = get_token(parts, AUTHORIZATION)?;
        let mut state = state.clone();
        let claims = state.jwt_service.validate_access_token(token).await?;
        Ok(Self(claims))
    }
}

#[derive(Debug)]
pub struct OptionalAuthenticated(pub Option<ClientJwtClaims>);

impl FromRequestParts<AppState> for OptionalAuthenticated {
    type Rejection = LocalErr;

    async fn from_request_parts(parts: &mut axum::http::request::Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let token = parts.headers.get(AUTHORIZATION)
            .and_then(|t| t.to_str().ok())
            .filter(|t| t.starts_with("Bearer "));

        if let Some(t) = token {
            let token_without_prefix = &t["Bearer ".len()..]; // Strip the "Bearer " prefix
            let mut state = state.clone();
            
            match state.jwt_service.validate_access_token(token_without_prefix).await {
                Ok(claims) => Ok(Self(Some(claims))),
                Err(_) => Ok(Self(None))
            }
        } else {
            Ok(Self(None))
        }
    }
}

pub struct S2SAuthenticated(pub S2SJwtClaims);
impl FromRequestParts<AppState> for S2SAuthenticated {
    type Rejection = LocalErr;

    async fn from_request_parts(parts: &mut axum::http::request::Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let token = get_token(parts, "s2s_authorization")?;
        let claims = state.s2s_jwt_service.validate_token(token)?;
        Ok(Self(claims))
    }
}

fn get_token(parts: &mut axum::http::request::Parts, header: impl AsHeaderName) -> LocalResult<&str> {
    match parts.headers.get(header) {
        Some(t) => {
            let t = t.to_str().map_err_print(|_| LocalErr::new(LocalErrKind::Unauthorized, StatusCode::UNAUTHORIZED))?;
            if !t.starts_with("Bearer ") {
                return Err(LocalErr::new(LocalErrKind::Unauthorized, StatusCode::UNAUTHORIZED));
            }
            Ok(&t["Bearer ".len()..]) // Strip the "Bearer " prefix
        },
        None => return Err(LocalErr::new(LocalErrKind::Unauthorized, StatusCode::UNAUTHORIZED))
    }
}