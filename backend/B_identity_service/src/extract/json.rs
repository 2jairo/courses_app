use axum::extract::{Request, FromRequest};
use axum::extract::rejection::JsonRejection;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::extract::Json as AxumJson;

use crate::error::LocalErr;

pub struct Json<T>(pub T);

impl<T> IntoResponse for Json<T>
where
    AxumJson<T>: IntoResponse,
{
    fn into_response(self) -> Response {
        AxumJson(self.0).into_response()
    }
}

impl<S, T> FromRequest<S> for Json<T>
where
    AxumJson<T>: FromRequest<S, Rejection = JsonRejection>,
    S: Send + Sync,
{
    type Rejection = (StatusCode, LocalErr);

    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {

        match AxumJson::<T>::from_request(req, state).await {
            Ok(value) => Ok(Self(value.0)),
            // convert the error from `axum::Json` into whatever we want
            Err(rejection) => {
                let status = rejection.status();
                let err = LocalErr::from(rejection);
    
                Err((status, err))
            }
        }
    }
}