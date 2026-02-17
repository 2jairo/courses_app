use std::{fs, io, path::{Path, PathBuf}};
use crate::{config::CONFIG};


fn sanitize_file_name(input: &str) -> String {
    let file_name = Path::new(input)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("");

    let mut sanitized = file_name
        .chars()
        .filter(|c| {
            !c.is_control()
            && *c != '/'
            && *c != '\\'
            && !['<', '>', ':', '"', '|', '?', '*'].contains(c)
        })
        .collect::<String>()
        .trim()
        .to_string();

    if sanitized == "." || sanitized == ".." {
        sanitized.clear();
    }

    if sanitized.is_empty() {
        sanitized = "file".to_string();
    }
    sanitized
}


pub struct OtherPathStructure {
    raw_file_path: String,
    original_file_name: String,
    root: PathBuf   
}
impl OtherPathStructure {
    pub fn new(file_path: String, file_id: i64, original_file_name: String) -> Result<Self, io::Error> {
        let s = Self {
            raw_file_path: Path::new(&CONFIG.raw_files_base_path).join(file_path).to_string_lossy().to_string(),
            root: Path::new(&CONFIG.processed_files_base_path).join(file_id.to_string()),
            original_file_name: original_file_name
        };

        fs::create_dir_all(&s.root)?;

        Ok(s)
    }
    
    pub fn raw_file_path(&self) -> &String {
        &self.raw_file_path
    }

    pub fn dest_path(&self) -> PathBuf {
        let sanitized = sanitize_file_name(&self.original_file_name);
        self.root.join(sanitized)
    }

    pub fn public(&self, path: &PathBuf) -> String {
        let p = path.strip_prefix(&self.root).unwrap_or(path);
        p.to_string_lossy().replace('\\', "/")   
    }
}