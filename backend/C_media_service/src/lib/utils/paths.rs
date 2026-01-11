use std::{fs, io, path::{Path, PathBuf}};

use crate::{amqp::messages::ImageKind, config::CONFIG};

pub struct VideoPathStructure {
    raw_file_path: String,
    root: PathBuf
}

impl VideoPathStructure {
    pub fn new(file_path: String, file_id: i64) -> Result<Self, io::Error> {
        let s = Self {
            raw_file_path: Path::new(&CONFIG.raw_files_base_path).join(file_path).to_string_lossy().to_string(),
            root: Path::new(&CONFIG.processed_files_base_path).join(file_id.to_string()),
        };

        // create necesary repositories
        fs::create_dir_all(s.root_posters())?;
        fs::create_dir_all(s.root_thumbnails())?;
        fs::create_dir_all(s.root_subtitles())?;

        Ok(s)
    }

    pub fn raw_file_path(&self) -> &String {
        &self.raw_file_path
    }


    pub fn root_indexm3u8(&self) -> PathBuf {
        self.root.join("index.m3u8")
    }

    pub fn root_posters(&self) -> PathBuf {
        self.root.join("posters")
    }
    pub fn root_posters_nwebp(&self, n: usize) -> PathBuf {
        self.root_posters().join(format!("{n}.webp"))
    }

    
    pub fn root_thumbnails(&self) -> PathBuf {
        self.root.join("thumbnails")
    }
    pub fn root_thumbnails_tvtt(&self) -> PathBuf {
        self.root_thumbnails().join("t.vtt")
    }
    pub fn root_thumbnails_nwebp(&self, image_name: &String) -> PathBuf {
        self.root_thumbnails().join(image_name)
    }
    pub fn root_thumbnails_nwebp_image_name(&self, n: u32) -> String {
        format!("{n}.webp")
    }


    pub fn root_subtitles(&self) -> PathBuf {
        self.root.join("subtitles")
    }
    pub fn root_subtitles_langvtt(&self, lang: &str) -> PathBuf {
        self.root_subtitles().join(format!("{}.vtt", lang))
    }


    pub fn root_resolution(&self, h: i32, framerate: i32) -> PathBuf {
        self.root.join(format!("{}_{}", h, framerate))
    }
    pub fn root_resolution_indexm3u8(&self, h: i32, framerate: i32) -> PathBuf {
        self.root_resolution(h, framerate).join("index.m3u8")
    }
    pub fn root_resolution_segmentts(&self, h: i32, framerate: i32) -> PathBuf {
        self.root_resolution(h, framerate).join("%d.ts")
    }
}


// pub struct ImagePathStructure {
//     raw_file_path: String,
//     root: PathBuf   
// }
// impl ImagePathStructure {
//     pub fn new(file_path: String, file_id: i64, kind: ImageKind) -> Result<Self, io::Error> {
//         let root = match kind {
//             ImageKind::LectureAsset => Path::new(&CONFIG.processed_files_base_path).join(file_id.to_string()),
//             ImageKind::UserAvatar =>  
//         };

//         let s = Self {
//             raw_file_path: Path::new(&CONFIG.raw_files_base_path).join(file_path).to_string_lossy().to_string(),
//             root: Path::new(&CONFIG.processed_files_base_path).join(file_id.to_string()),
//         };

//         Ok(s)
//     }
// }