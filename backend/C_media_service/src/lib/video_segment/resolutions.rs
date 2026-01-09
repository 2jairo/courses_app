use crate::lib::video_info::VideoInfo;

#[derive(Clone, Copy, Debug)]
pub struct ResFrameBitrate {
    pub a_bitrate: Option<i32>,
    pub v_bitrate: u32,
    pub h: i32,
    pub w: i32,
    pub target_framerate: i32,
    min_framerate: i32,
}
impl ResFrameBitrate {
    const fn new(h: i32, a_bitrate: i32, min_framerate: i32, target_framerate: i32) -> Self {
        Self { 
            a_bitrate: Some(a_bitrate), 
            v_bitrate: 0,
            h, 
            w: 0, 
            min_framerate, 
            target_framerate 
        }
    }
}

pub struct Resolutions<'a> {
    video_info: &'a VideoInfo,
    current: usize
}
impl<'a> Resolutions<'a> {
    const MIN_RESOLUTION: i32 = 144;
    const BPPF: f32 = 0.09 / 1000.0;// Kb per pixel per frame

    const AUDIO_LOW: i32 = 96_000;
    const AUDIO_MEDIUM: i32 = 128_000;
    const AUDIO_HIGH: i32 = 160_000;
    const AUDIO_VERY_HIGH: i32 = 192_000;
    
    pub const RESOLUTIONS_BITRATE_TABLE: [ResFrameBitrate; 13] = [
        ResFrameBitrate::new(4320, Self::AUDIO_VERY_HIGH, 60, 120),
        ResFrameBitrate::new(4320, Self::AUDIO_VERY_HIGH, 0, 30),
        ResFrameBitrate::new(2160, Self::AUDIO_VERY_HIGH, 60, 120),
        ResFrameBitrate::new(2160, Self::AUDIO_VERY_HIGH, 0, 30),
        ResFrameBitrate::new(1440, Self::AUDIO_HIGH, 60, 120),
        ResFrameBitrate::new(1440, Self::AUDIO_HIGH, 0, 30),
        ResFrameBitrate::new(1080, Self::AUDIO_HIGH, 60, 120),
        ResFrameBitrate::new(1080, Self::AUDIO_HIGH, 0, 30),
        ResFrameBitrate::new(720, Self::AUDIO_MEDIUM, 60, 60),
        ResFrameBitrate::new(720, Self::AUDIO_MEDIUM, 0, 30),
        ResFrameBitrate::new(480, Self::AUDIO_LOW,  0, 30),
        ResFrameBitrate::new(360, Self::AUDIO_LOW, 0, 30),
        ResFrameBitrate::new(240, Self::AUDIO_LOW, 0, 30),
    ];
}

impl<'a> Resolutions<'a> {
    pub fn new(video_info: &'a VideoInfo) -> Self {
        Self { video_info, current: 0 }
    }
}


impl<'a> Iterator for Resolutions<'a> {
    type Item = ResFrameBitrate;

    fn next(&mut self) -> Option<Self::Item> {
        let mut w;
        let mut res = loop {
            if self.current == Self::RESOLUTIONS_BITRATE_TABLE.len() {
                return None;
            }

            let res = &Self::RESOLUTIONS_BITRATE_TABLE[self.current];
            let largest_dimension = self.video_info.h.min(self.video_info.w);

            if largest_dimension < res.h as u32 {
                self.current += 1;
                continue;
            }

            if res.min_framerate > self.video_info.framerate {
                self.current += 1;
                continue;
            }

            w = (res.h as f32 * self.video_info.aspect_ratio).round() as i32;
            if w < Self::MIN_RESOLUTION || res.h < Self::MIN_RESOLUTION {
                self.current += 1;
                continue;
            }
            break *res;
        };

        res.w = w;
        res.target_framerate = res.target_framerate.min(self.video_info.framerate);

        let factor = match res.target_framerate {
            0..=30 => res.target_framerate as f32,
            _ => res.target_framerate as f32 / 1.5
        };
        
        res.v_bitrate = (res.w as f32 * res.h as f32 * factor as f32 * Self::BPPF) as u32;
        res.v_bitrate = res.v_bitrate.min(self.video_info.v_bitrate);

        res.a_bitrate = match self.video_info.a_bitrate {
            Some(a_bitrate) => Some(res.a_bitrate.unwrap().min(a_bitrate as i32)),
            None => None
        };

        self.current += 1;
        Some(res)
    }
}

