use std::{error::Error, fmt::Display, panic::Location};
use axum::{extract::{multipart::MultipartRejection, rejection::{BytesRejection, JsonRejection, PathRejection, QueryRejection}}, http::StatusCode, response::IntoResponse};
use sea_orm::DbErr;
use serde::{ser::SerializeStruct, Serialize};
use strum::IntoStaticStr;

use crate::extract::Json;

pub trait MapErrPrint<T, E>: Sized {
    #[track_caller]
    fn map_err_print<F, O>(self, op: O) -> Result<T, F> 
    where 
        E: Display, 
        O: FnOnce(E) -> F;
}

impl<T, E> MapErrPrint<T, E> for Result<T, E> {
    #[track_caller]
    fn map_err_print<F, O>(self, op: O) -> Result<T, F>
    where
        E: Display,
        O: FnOnce(E) -> F,
    {
        match self {
            Ok(t) => Ok(t),
            Err(e) => {
                let loc = Location::caller();
                eprintln!("{}:{} → {}", loc.file(), loc.line(), e);
                Err(op(e))
            }
        }
    }
}


#[derive(Debug, Clone, Copy, IntoStaticStr)]
pub enum LocalErrKind {
    // media
    VideoResolutionTooLow,
    InvalidVideoFormat,
    InvalidImageFormat,
    StoreVideo,
    StoreImage,
    VideoNotFound,

    // auth
    LoginError,
    CreateUser,
    UserAlredyExists,
    VersionMismatch,
    NotLogged,
    Unauthorized,

    // extract
    JsonRejection,
    QueryRejection, 
    BytesRejection, 
    PathRejection,
    WebSocketUpgradeRejection,
    MultipartRejection,

    Code500,
    NotFound,
}

#[derive(Debug, Clone)]
pub struct LocalErr {
    pub error: LocalErrKind,
    pub msg: Option<String>,
    pub code: StatusCode,
}

pub type LocalResult<T> = Result<T, LocalErr>;

struct ErrRespInner {
    pub error: LocalErrKind,
    pub msg: Option<String>
}

impl Display for LocalErr {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl Error for LocalErr {}


impl Serialize for ErrRespInner {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where S: serde::Serializer 
    {
        match self.msg.as_ref() {
            Some(msg) => {
                let mut state = serializer.serialize_struct("ErrResponse", 2)?;
        
                let error: &str = self.error.into();
                state.serialize_field("error", error)?;
                state.serialize_field("msg", msg)?;
                state.end()
            },
            None => {
                let mut state = serializer.serialize_struct("ErrResponse", 1)?;
        
                let error: &str = self.error.into();
                state.serialize_field("error", &error)?;
                state.end()
            }
        }        

    }
}


impl LocalErr {
    pub fn new(e: LocalErrKind, code: StatusCode) -> Self {
        Self { error: e, code, msg: None }
    }

    pub fn with_msg(mut self, msg: impl Into<String>) -> Self {
        self.msg = Some(msg.into());
        self
    }
}


impl IntoResponse for LocalErr {
    fn into_response(self) -> axum::response::Response {
        let body = Json(ErrRespInner { error: self.error, msg: self.msg });

        let mut resp = body.into_response();
        *resp.status_mut() = self.code;
        resp
    }
}

impl From<JsonRejection> for LocalErr {
    fn from(value: JsonRejection) -> Self {
        Self::new(LocalErrKind::JsonRejection, StatusCode::BAD_REQUEST).with_msg(value.body_text())
    }
}

impl From<QueryRejection> for LocalErr {
    fn from(value: QueryRejection) -> Self {
        Self::new(LocalErrKind::QueryRejection, StatusCode::BAD_REQUEST).with_msg(value.body_text())
    }
}

impl From<BytesRejection> for LocalErr {
    fn from(value: BytesRejection) -> Self {
        Self::new(LocalErrKind::BytesRejection, StatusCode::BAD_REQUEST).with_msg(value.body_text())
    }
}

impl From<PathRejection> for LocalErr {
    fn from(value: PathRejection) -> Self {
        Self::new(LocalErrKind::PathRejection, StatusCode::BAD_REQUEST).with_msg(value.body_text())
    }
}

impl From<MultipartRejection> for LocalErr {
    fn from(value :MultipartRejection) -> Self {
        Self::new(LocalErrKind::MultipartRejection, StatusCode::BAD_REQUEST).with_msg(value.body_text())
    }
}

// impl From<WebSocketUpgradeRejection> for ErrResp {
//     fn from(value: WebSocketUpgradeRejection) -> Self {
//         Self::new(ErrRespKind::WebSocketUpgradeRejection, StatusCode::BAD_REQUEST).with_msg(value.body_text())
//     }
// }

// impl From<TypedMultipartError> for ErrResp {
//     fn from(value: TypedMultipartError) -> Self {
//         Self::new(ErrRespKind::MultipartRejection, StatusCode::BAD_REQUEST).with_msg(value.to_string())
//     }
// }

impl From<DbErr> for LocalErr {
    fn from(_value: DbErr) -> Self {
        Self::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR)
    }
}