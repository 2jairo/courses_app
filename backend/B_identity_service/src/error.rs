use std::{collections::HashMap, error::Error, fmt::Display, panic::Location};
use axum::{extract::{multipart::MultipartRejection, rejection::{BytesRejection, JsonRejection, PathRejection, QueryRejection}}, http::{Method, StatusCode, Uri}, response::IntoResponse};
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


#[derive(Debug, IntoStaticStr, Clone)]
pub enum LocalErrKind {
    // media
    VideoResolutionTooLow {
        resolution: (u32, u32),
        min: (u32, u32)
    },
    InvalidVideoFormat,
    InvalidImageFormat,
    StoreVideo,
    StoreImage,
    VideoNotFound,

    // auth
    UserAlredyExists,
    NotLogged,
    Unauthorized,
    InvalidAccessToken,
    InvalidRefreshToken,

    // extract
    JsonRejection(String),
    QueryRejection(String), 
    BytesRejection(String), 
    PathRejection(String),
    WebSocketUpgradeRejection(String),
    MultipartRejection(String),
    ValidationRejection {
        fields: HashMap<String, Vec<String>>
    },
    Code500,
    NotFound,
    MethodNotAllowed,
    RouteNotFound {
        uri: Uri,
        method: Method
    },
}
impl LocalErrKind {
    pub fn get_msg(&self) -> Option<serde_json::Value> {
        match self {
            LocalErrKind::RouteNotFound { uri, method } => {
                Some(serde_json::json!({
                    "uri": uri.path(),
                    "method": method.as_str()
                }))
            },
            LocalErrKind::VideoResolutionTooLow { resolution, min } => {
                Some(serde_json::json!({ 
                    "resolution": resolution, 
                    "min": min 
                }))
            },
            LocalErrKind::ValidationRejection { fields } => {
                Some(serde_json::json!({
                    "fields": fields
                }))
            },
            LocalErrKind::JsonRejection(value) => {
                Some(serde_json::json!(value))
            }
            LocalErrKind::QueryRejection(value) => {
                Some(serde_json::json!(value))
            }
            LocalErrKind::BytesRejection(value) => {
                Some(serde_json::json!(value))
            }
            LocalErrKind::PathRejection(value) => {
                Some(serde_json::json!(value))
            }
            LocalErrKind::WebSocketUpgradeRejection(value) => {
                Some(serde_json::json!(value))
            }
            LocalErrKind::MultipartRejection(value) => {
                Some(serde_json::json!(value))
            }
            _ => None
        }
    }
}




#[derive(Debug)]
pub struct LocalErr {
    pub error: LocalErrKind,
    pub code: StatusCode,
}

pub type LocalResult<T> = Result<T, LocalErr>;

struct ErrRespInner {
    pub error: LocalErrKind
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
        let error = self.error.clone();
        let msg = error.get_msg();

        let mut state = match msg {
            Some(reason) => {
                let mut state = serializer.serialize_struct("ErrResponse", 2)?;
                state.serialize_field("msg", &reason)?;
                state
            },
            None => {
                serializer.serialize_struct("ErrResponse", 2)?
            }
        };

        state.serialize_field("error", error.into())?;
        state.end()  
    }
}

impl LocalErr {
    pub fn new(e: LocalErrKind, code: StatusCode) -> Self {
        Self { error: e, code }
    }
}


impl IntoResponse for LocalErr {
    fn into_response(self) -> axum::response::Response {
        let body = Json(ErrRespInner { error: self.error });

        let mut resp = body.into_response();
        *resp.status_mut() = self.code;
        resp
    }
}

impl From<JsonRejection> for LocalErr {
    fn from(value: JsonRejection) -> Self {
        Self::new(LocalErrKind::JsonRejection(value.body_text()), StatusCode::BAD_REQUEST)
    }
}

impl From<QueryRejection> for LocalErr {
    fn from(value: QueryRejection) -> Self {
        Self::new(LocalErrKind::QueryRejection(value.body_text()), StatusCode::BAD_REQUEST)
    }
}

impl From<BytesRejection> for LocalErr {
    fn from(value: BytesRejection) -> Self {
        Self::new(LocalErrKind::BytesRejection(value.body_text()), StatusCode::BAD_REQUEST)
    }
}

impl From<PathRejection> for LocalErr {
    fn from(value: PathRejection) -> Self {
        Self::new(LocalErrKind::PathRejection(value.body_text()), StatusCode::BAD_REQUEST)
    }
}

impl From<MultipartRejection> for LocalErr {
    fn from(value :MultipartRejection) -> Self {
        Self::new(LocalErrKind::MultipartRejection(value.body_text()), StatusCode::BAD_REQUEST)
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