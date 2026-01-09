use std::{collections::HashMap, fmt::Display, panic::Location};
use serde::{Serialize, ser::SerializeStruct};
use strum::IntoStaticStr;

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

    // extract
    ValidationRejection {
        fields: HashMap<String, Vec<String>>
    },
    Code500
}


impl LocalErrKind {
    pub fn get_msg(&self) -> Option<serde_json::Value> {
        match self {
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
            _ => None
        }
    }
}





#[derive(Debug)]
pub struct LocalErr {
    pub error: LocalErrKind,
    pub code: u16
}

impl Serialize for LocalErr {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where S: serde::Serializer 
    {
        let error = self.error.clone();
        let msg = error.get_msg();

        let mut state = match msg {
            Some(reason) => {
                let mut state = serializer.serialize_struct("ErrResponse", 3)?;
                state.serialize_field("msg", &reason)?;
                state
            },
            None => {
                serializer.serialize_struct("ErrResponse", 2)?
            }
        };

        state.serialize_field("code", &self.code)?;
        state.serialize_field("error", error.into())?;
        state.end()  
    }
}



impl LocalErr {
    pub fn new(e: LocalErrKind, code: u16) -> Self {
        Self { error: e, code }
    }

    pub fn to_bytes(self) -> Vec<u8> {
        serde_json::to_vec(&self).unwrap()
    }

    pub fn should_requeue(&self) -> bool {
        match self.error {
            // internal or transient errors → requeue
            LocalErrKind::Code500 => true,
            _ => false,
        }
    }
}

pub type LocalResult<T> = Result<T, LocalErr>;
