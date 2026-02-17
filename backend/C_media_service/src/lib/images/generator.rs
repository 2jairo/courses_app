use std::collections::HashMap;
use std::fs::File;
use image::DynamicImage;
use image::imageops::FilterType;
use serde::Serialize;
use webp::Encoder;

use crate::amqp::messages::ImageResolutionVariant;
use crate::error::{LocalErr, LocalErrKind, LocalResult, MapErrPrint};
use crate::lib::images::resolutions::ImageResolutions;
use crate::lib::utils::image_path::ImagePathStructure;

#[derive(Serialize, Debug)]
pub struct ProcessImageResolutionsResponse {
    path: String,
    w: u32,
    h: u32
}

pub struct ImageGenerator<'a> {
    paths: &'a ImagePathStructure,
    pub img: DynamicImage
}

impl<'a> ImageGenerator<'a> {
    pub fn new(paths: &'a ImagePathStructure) -> LocalResult<Self> {
        let mut buf = Vec::new();
    
        let mut file = File::open(paths.raw_file_path())
            .map_err_print(|_| LocalErr::new(LocalErrKind::StoreImage, 500))?;
    
        std::io::Read::read_to_end(&mut file, &mut buf)
            .map_err_print(|_| LocalErr::new(LocalErrKind::StoreImage, 500))?;

        let img = image::load_from_memory(&buf)
            .map_err_print(|_| LocalErr::new(LocalErrKind::InvalidImageFormat, 400))?;


        Ok(Self { paths, img })
    }
    
    pub fn process_resolutions(&self) -> LocalResult<HashMap<ImageResolutionVariant, ProcessImageResolutionsResponse>> {
        let resolutions = ImageResolutions::new(&self.img)
            .into_iter()
            .collect::<Vec<_>>();

        let mut resp = HashMap::with_capacity(resolutions.len());

        for res in resolutions {
            let img_path = self.process_image(res.w, res.h)?;
            resp.insert(res.variant, ProcessImageResolutionsResponse { path: img_path, w: res.w, h: res.h });            
        }

        Ok(resp)
    }

    fn process_image(&self, resize_w: u32, resize_h: u32) -> LocalResult<String> {    
        let img = {    
            // let (w, h) = self.img.dimensions();

            // let (new_w, new_h) = match resize_to {
            //     None => (w, h),
            //     Some(to) => resized_dimensions(w, h, to)
            // };
            
            self.img.resize(resize_w, resize_h, FilterType::Triangle).to_rgb8()
        };
    
        let (width, height) = img.dimensions();
        let bytes = Encoder::from_rgb(&img, width, height).encode(85.0);
    
        let img_file_path = self.paths.dest_path(resize_h);
        let mut img_file = File::create(&img_file_path)
            .map_err_print(|_| LocalErr::new(LocalErrKind::StoreImage, 500))?;
        
        std::io::Write::write_all(&mut img_file, &bytes)
            .map_err_print(|_| LocalErr::new(LocalErrKind::StoreImage, 500))?;
    
        Ok(self.paths.public(&img_file_path))
    }
}
