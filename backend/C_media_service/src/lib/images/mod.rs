use std::{fs::File, path::PathBuf};
use image::GenericImageView;
use image::imageops::FilterType;
use webp::Encoder;

use crate::error::{LocalErr, LocalErrKind, LocalResult, MapErrPrint};
use crate::lib::utils::resized_dimensions;

pub struct ProcessImage<'a> {
    img_path: &'a PathBuf,
    dest_path: &'a PathBuf,
    resize_to: Option<u32>
}

impl<'a> ProcessImage<'a> {
    pub fn new(img_path: &'a PathBuf, dest_path: &'a PathBuf, resize_to: Option<u32>) -> Self {
        Self { img_path, dest_path, resize_to }
    }

    pub fn process_image(&self) -> LocalResult<()> {
        let mut buf = Vec::new();
    
        let mut file = File::open(self.img_path)
            .map_err_print(|_| LocalErr::new(LocalErrKind::StoreImage, 500))?;
    
        std::io::Read::read_to_end(&mut file, &mut buf)
            .map_err_print(|_| LocalErr::new(LocalErrKind::StoreImage, 500))?;
    
        let img = {
            let img = image::load_from_memory(&buf)
                .map_err_print(|_| LocalErr::new(LocalErrKind::InvalidImageFormat, 400))?;
    
            let (w, h) = img.dimensions();

            let (new_w, new_h) = match self.resize_to {
                None => (w, h),
                Some(to) => resized_dimensions(w, h, to)
            };
            
            img.resize(new_w, new_h, FilterType::Triangle).to_rgb8()
        };
    
        let (width, height) = img.dimensions();
        let bytes = Encoder::from_rgb(&img, width, height).encode(85.0);
    
        let mut img_file = File::create(self.dest_path)
            .map_err_print(|_| LocalErr::new(LocalErrKind::StoreImage, 500))?;
        
        std::io::Write::write_all(&mut img_file, &bytes)
            .map_err_print(|_| LocalErr::new(LocalErrKind::StoreImage, 500))?;
    
        Ok(())
    }
}
