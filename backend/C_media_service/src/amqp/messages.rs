use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::{error::LocalErr, lib::images::generator::ProcessImageResolutionsResponse};

// ------------- Videos
#[derive(Serialize, Debug)]
pub struct ProcessVideoStepsSpeechToTextLanguages {
    pub language: String,
    pub path: String,
    pub native: bool
}

#[derive(Serialize, Debug)]
#[serde(tag = "variant", content = "body")]
pub enum ProcessVideoSteps {
    Info {
        duration: f32,
    },
    Resolutions {
        media_playlist: String,
        resolutions_framerate: Vec<(i32, i32)>
    },
    Poster {
        path: String
    },
    Thumbnails {
        path: String,
    },
    SpeechToText {
        languages: Vec<ProcessVideoStepsSpeechToTextLanguages>,
    },
    Error {
        error: LocalErr
    }
}

#[derive(Deserialize, Debug)]
#[allow(dead_code)]
pub struct ProcessVideoRequestMessage {
    pub user_id: i64,
    pub course_id: i64,
    pub file_id: i64,
    pub file_size: i64,
    pub file_path: String
}

// ------------- Images
#[derive(Serialize, Debug, Clone, Copy, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum ImageResolutionVariant {
    Thumbnail,
    Small,
    Large,
    Native
}

#[derive(Serialize, Debug)]
#[serde(tag = "variant", content = "body")]
pub enum ProcessImageSteps {
    Resolutions {
        resolutions: HashMap<ImageResolutionVariant, ProcessImageResolutionsResponse>
    },
    Error {
        error: LocalErr
    }
}



#[derive(Deserialize, Debug)]
#[allow(dead_code)]
pub struct ProcessImageRequestMessage {
    pub user_id: i64,
    pub file_id: i64,
    pub video_id: Option<i64>,
    pub file_path: String,
}