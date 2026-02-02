use image::{DynamicImage, GenericImageView};

use crate::amqp::messages::ImageResolutionVariant;

#[derive(Clone, Copy, Debug)]
pub struct ImageResolutionSpec {
    pub h: u32,          // target height, -1 = native
    pub w: u32,          // computed width
    pub variant: ImageResolutionVariant
}

impl ImageResolutionSpec {
    const fn new(h: u32, variant: ImageResolutionVariant) -> Self {
        Self {
            h,
            w: 0,
            variant
        }
    }
}

pub struct ImageResolutions<'a> {
    img: &'a DynamicImage,
    current: usize
}
impl<'a> ImageResolutions<'a> {
    pub const RESOLUTIONS_TABLE: [ImageResolutionSpec; 4] = [
        ImageResolutionSpec::new(64, ImageResolutionVariant::Thumbnail),// avatar
        ImageResolutionSpec::new(480, ImageResolutionVariant::Small),   // SD
        ImageResolutionSpec::new(1080, ImageResolutionVariant::Large),  // HD
        ImageResolutionSpec::new(0, ImageResolutionVariant::Native),    // native
    ];

    const MIN_RESOLUTION: u32 = 64;

    pub fn new(img: &'a DynamicImage) -> Self {
        Self { img, current: 0 }
    }
}

impl<'a> Iterator for ImageResolutions<'a> {
    type Item = ImageResolutionSpec;

    fn next(&mut self) -> Option<Self::Item> {
        let (orig_w, orig_h) = self.img.dimensions();
        let aspect_ratio = orig_w as f32 / orig_h as f32;

        let mut w;
        let res = loop {
            if self.current == Self::RESOLUTIONS_TABLE.len() {
                return None;
            }

            let spec = &Self::RESOLUTIONS_TABLE[self.current];

            // Native resolution
            if spec.h == 0 {
                // Skip native if it matches an existing target height
                if matches!(orig_h, 64 | 480 | 1080) {
                    self.current += 1;
                    continue;
                }

                break ImageResolutionSpec {
                    h: orig_h,
                    w: orig_w,
                    variant: spec.variant
                };
            }

            // Skip upscaling
            if orig_h < spec.h {
                self.current += 1;
                continue;
            }

            w = (spec.h as f32 * aspect_ratio).round() as u32;

            if w < Self::MIN_RESOLUTION || spec.h < Self::MIN_RESOLUTION {
                self.current += 1;
                continue;
            }

            break ImageResolutionSpec {
                h: spec.h,
                w,
                variant: spec.variant
            };
        };

        self.current += 1;
        Some(res)
    }
}

