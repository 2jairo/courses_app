use std::{fs, io, path::{Path, PathBuf}};
use crate::{config::CONFIG};

pub struct ImagePathStructure {
    raw_file_path: String,
    root: PathBuf   
}
impl ImagePathStructure {
    pub fn new(file_path: String, file_id: i64) -> Result<Self, io::Error> {
        let s = Self {
            raw_file_path: Path::new(&CONFIG.raw_files_base_path).join(file_path).to_string_lossy().to_string(),
            root: Path::new(&CONFIG.processed_files_base_path).join(file_id.to_string()),
        };

        fs::create_dir_all(&s.root)?;

        Ok(s)
    }
    
    pub fn raw_file_path(&self) -> &String {
        &self.raw_file_path
    }

    pub fn dest_path(&self, h: u32) -> PathBuf {
        self.root.join(format!("{h}.webp"))
    }
        
    pub fn public(&self, path: &PathBuf) -> String {
        let p = path.strip_prefix(&self.root).unwrap_or(path);
        p.to_string_lossy().replace('\\', "/")   
    }
}