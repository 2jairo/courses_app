use axum::{extract::{multipart::{Field, MultipartError}, FromRequest, Multipart as AxumMultipart, Request}, http::StatusCode};

use crate::error::LocalErr;

pub struct Multipart {
    inner: AxumMultipart
}

impl<S> FromRequest<S> for Multipart
where
    S: Send + Sync,
{
    type Rejection = (StatusCode, LocalErr);

    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {
        match AxumMultipart::from_request(req, state).await {
            Ok(inner) => Ok(Self { inner }),
            Err(rejection) => {
                let status = rejection.status();
                let err = LocalErr::from(rejection);

                Err((status, err))
            }
        }
    }
}

impl Multipart {
    pub async fn next_field(&mut self) -> Result<Option<Field<'_>>, MultipartError> {
        self.inner.next_field().await
    }
}