use std::{fs, io};
use crate::lib::utils::other_path::OtherPathStructure;

pub struct FileChecker<'a> {
    paths: &'a OtherPathStructure,
}

impl<'a> FileChecker<'a> {
    pub fn new(paths: &'a OtherPathStructure) -> Self {
        Self { paths }
    }

    pub fn save(&self) -> Result<String, io::Error> {
        let source = self.paths.raw_file_path();
        let dest = self.paths.dest_path();
                
        fs::copy(source, &dest)?;
        Ok(self.paths.public(&dest))
    }
}