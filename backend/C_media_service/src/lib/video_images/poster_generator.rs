use std::{fs::File, io::Write};

use gstreamer::{
    Caps, ClockTime, ElementFactory, MessageType, Pipeline, SeekFlags, State,
    glib::object::{Cast, ObjectExt},
    prelude::{ElementExt, ElementExtManual, GstBinExtManual, PadExt},
};
use gstreamer_app::AppSink;

use crate::lib::{utils::{self, video_path::VideoPathStructure}, video_info::VideoInfo};

pub struct PosterGenerator<'a> {
    paths: &'a VideoPathStructure,
    width: u32,
    height: u32,
}

impl<'a> PosterGenerator<'a> {
    pub fn new(video_info: &VideoInfo, paths: &'a VideoPathStructure, size: u32) -> Self {
        let (w, h) = utils::resized_dimensions(video_info.w, video_info.h, size);

        Self {
            paths,
            width: w,
            height: h,
        }
    }

    pub fn get_default_poster(&self) -> anyhow::Result<String> {
        let pipeline = Pipeline::new();

        let filesrc = ElementFactory::make("filesrc").build()?;
        let decodebin3 = ElementFactory::make("decodebin").build()?;
        let videoscale = ElementFactory::make("videoscale").build()?;
        let videoconvert = ElementFactory::make("videoconvert").build()?;
        let capsfilter = ElementFactory::make("capsfilter").build()?;
        let appsink = ElementFactory::make("appsink").build()?;

        let caps = Caps::builder("video/x-raw")
            .field("format", "RGBA")
            .field("width", self.width as i32)
            .field("height", self.height as i32)
            .build();

        filesrc.set_property("location", self.paths.raw_file_path().as_str());
        capsfilter.set_property("caps", &caps);
        appsink.set_property("max-buffers", 1u32);

        pipeline.add_many(&[
            &filesrc,
            &decodebin3,
            &videoscale,
            &videoconvert,
            &capsfilter,
            &appsink,
        ])?;

        filesrc.link(&decodebin3)?;
        videoscale.link(&videoconvert)?;
        videoconvert.link(&capsfilter)?;
        capsfilter.link(&appsink)?;
        decodebin3.connect_pad_added(move |_, src_pad| {
            let sink_pad = videoscale.static_pad("sink").unwrap();
            if !sink_pad.is_linked() {
                src_pad.link(&sink_pad).unwrap();
            }
        });

        pipeline.set_state(State::Playing)?;

        let appsink = appsink.dynamic_cast::<AppSink>().unwrap();
        let bus = pipeline.bus().unwrap();
        bus.timed_pop_filtered(
            Some(ClockTime::from_seconds(5)),
            &[MessageType::AsyncDone, MessageType::Error],
        );

        pipeline.seek_simple(
            SeekFlags::FLUSH | SeekFlags::ACCURATE,
            ClockTime::from_seconds(5),
        )?;
        bus.timed_pop_filtered(
            Some(ClockTime::from_seconds(5)),
            &[MessageType::AsyncDone, MessageType::Error],
        );

        let sample = appsink.pull_sample()?;
        let buffer = sample.buffer().unwrap();
        let map = buffer.map_readable().unwrap();
        let img_buf = map.as_slice();

        let webp_image = webp::Encoder::from_rgba(img_buf, self.width, self.height).encode(85.0);
        
        let webp_file_path = self.paths.root_posters_nwebp(self.calculate_poster_n());
        let mut webp_file = File::create(&webp_file_path)?;
        webp_file.write(&webp_image)?;

        pipeline.set_state(State::Null).unwrap();
        Ok(self.paths.public(&webp_file_path))
    }

    fn calculate_poster_n(&self) -> usize {
        let posters_dir = self.paths.root_posters();

        std::fs::read_dir(posters_dir)
            .map(|entries| entries.filter_map(Result::ok).count())
            .unwrap_or(0)
    }
}
