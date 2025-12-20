use axum::extract::FromRequestParts;
use axum::extract::rejection::QueryRejection;
use axum::http::request::Parts;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use crate::error::LocalErr;
use axum::extract::Query as AxumQuery;

pub struct Query<T>(pub T);

impl<T> IntoResponse for Query<T>
where
    AxumQuery<T>: IntoResponse,
{
    fn into_response(self) -> Response {
        AxumQuery(self.0).into_response()
    }
}

impl<S, T> FromRequestParts<S> for Query<T>
where
    AxumQuery<T>: FromRequestParts<S, Rejection = QueryRejection>,
    S: Send + Sync,
{
    type Rejection = (StatusCode, LocalErr);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        match AxumQuery::from_request_parts(parts, state).await {
            Ok(value) => Ok(Self(value.0)),
            // convert the error from `axum::Query` into whatever we want
            Err(rejection) => {
                let status = rejection.status();
                let err = LocalErr::from(rejection);
    
                Err((status, err))
            }
        }
    }
}