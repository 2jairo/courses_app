use gstreamer::ClockTime;
use gstreamer_pbutils::Discoverer;

use crate::error::{LocalErr, LocalErrKind, LocalResult, MapErrPrint};

#[derive(Debug, Clone)]
pub struct VideoInfo {
    pub duration: ClockTime,
    pub a_bitrate: Option<u32>,
    pub v_bitrate: u32,
    pub w: u32,
    pub h: u32,
    pub aspect_ratio: f32,
    pub framerate: i32
}

impl VideoInfo {
    pub fn from_file(path: &str) -> LocalResult<Self> {
        let timeout = ClockTime::from_seconds(10);
        let discoverer = Discoverer::new(timeout)
            .map_err_print(|_| LocalErr::new(LocalErrKind::InvalidVideoFormat, 400))?;

        let uri = format!("file:///{}", path);
        let info = discoverer.discover_uri(&uri)
            .map_err_print(|_| LocalErr::new(LocalErrKind::InvalidVideoFormat, 400))?;

        let duration = info.duration()
            .ok_or(LocalErr::new(LocalErrKind::InvalidVideoFormat, 400))?;

        let video_streams = info.video_streams();
        let audio_streams = info.audio_streams();        

        let audio = audio_streams.first();
        let video = video_streams.first()
            .ok_or(LocalErr::new(LocalErrKind::InvalidVideoFormat, 400))?;

        let w = video.width();
        let h = video.height();
        let framerate = video.framerate().0.to_integer();

        if video.is_image() || framerate == 0 || duration.is_zero() {
            return Err(LocalErr::new(LocalErrKind::InvalidVideoFormat, 400))
        }

        Ok(Self {
            duration,
            a_bitrate: audio.map(|a| a.bitrate()),
            v_bitrate: video.bitrate(),
            framerate,
            w, h,
            aspect_ratio: w as f32 / h as f32
        })
    }
}