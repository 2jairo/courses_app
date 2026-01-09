use serde::{Deserialize, Serialize};

use crate::error::LocalErr;

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
pub struct ProcessVideoRequestMessage {
    pub user_id: i64,
    pub course_id: i64,
    pub file_id: i64,
    pub file_size: u64,
    pub file_path: String,
}

// -------------

#[derive(Serialize, Debug)]
pub enum ProcessImageSteps {

    Error {
        error: LocalErr
    }
}