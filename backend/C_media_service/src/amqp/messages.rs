use serde::{Deserialize, Serialize};

use crate::error::LocalErr;

// ------------- Videos

#[derive(Serialize, Debug)]
pub enum ProcessVideoSteps {
    Info {
        duration: f32,
    },
    Resolutions,
    Poster {
        path: String
    },
    Thumbnail {
        path: String,
    },
    SpeechToText {
        languages: Vec<String>,
        native: String
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

#[derive(Serialize, Debug)]
pub enum ProcessImageSteps {
    Error {
        error: LocalErr
    }
}


#[derive(Deserialize, Debug)]
pub enum ImageKind {
    UserAvatar,
    VideoPoster,
    LectureAsset
}


#[derive(Deserialize, Debug)]
#[allow(dead_code)]
pub struct ProcessImageRequestMessage {
    pub user_id: i64,
    pub file_id: i64,
    pub file_path: String,
    pub kind: ImageKind
}