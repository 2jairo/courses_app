use axum::extract::FromRequestParts;
use axum::extract::rejection::PathRejection;
use axum::http::request::Parts;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use crate::error::LocalErr;
use axum::extract::Path as AxumPath;

pub struct Path<T>(pub T);

impl<T> IntoResponse for Path<T>
where
    AxumPath<T>: IntoResponse,
{
    fn into_response(self) -> Response {
        AxumPath(self.0).into_response()
    }
}

impl<S, T> FromRequestParts<S> for Path<T>
where
    AxumPath<T>: FromRequestParts<S, Rejection = PathRejection>,
    S: Send + Sync,
{
    type Rejection = (StatusCode, LocalErr);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        match AxumPath::from_request_parts(parts, state).await {
            Ok(value) => Ok(Self(value.0)),
            Err(rejection) => {
                let status = rejection.status();
                let err = LocalErr::from(rejection);
    
                Err((status, err))
            }
        }
    }
}