use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::{error::LocalErr, lib::images::generator::ProcessImageResolutionsResponse};

#[derive(Deserialize, Debug)]
pub struct ProcessAnyCommonRequest {
    pub user_id: i64,
    pub file_id: i64,
    pub file_size: i64,
    pub file_path: String,
    pub original_file_name: String
}

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
    pub common: ProcessAnyCommonRequest,
    pub course_id: i64,
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
    pub common: ProcessAnyCommonRequest,
    pub video_id: Option<i64>,
}


// ------------- Other
#[derive(Deserialize, Debug)]
#[allow(dead_code)]
pub struct ProcessOtherRequestMessage {
    pub common: ProcessAnyCommonRequest
}

#[derive(Serialize, Debug)]
#[serde(tag = "variant", content = "body")]
pub enum ProcessOtherSteps {
    Ok {
        path: String
    },
    Error {
        error: LocalErr
    }
}
