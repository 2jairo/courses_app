use std::{fs::File, io::{self, ErrorKind, Write}};

use gstreamer::{Caps, ClockTime, ElementFactory, MessageType, Pipeline, SeekFlags, State, glib::object::{Cast, ObjectExt}, prelude::{ElementExt, ElementExtManual, GstBinExtManual, PadExt}};
use gstreamer_app::AppSink;
use image::{DynamicImage, ImageBuffer, RgbaImage};

use crate::lib::{utils::{self, paths::VideoPathStructure}, video_images::vtt::VttThumbnails, video_info::VideoInfo};

pub struct ThumbnailsGenerator<'a> {
    width: u32,
    height: u32,
    seconds_interval: ClockTime,
    thumbnails_count: u32,
    vtt: VttThumbnails,
    paths: &'a VideoPathStructure,
    buffers: Vec<(Vec<u8>, ClockTime)>
}

impl<'a> ThumbnailsGenerator<'a> {
    const VIDEO_THUMBNAILS_COLS: u32 = 10;
    const VIDEO_THUMBNAILS_ROWS: u32 = 10;
    const INTERVALS: [(u64, u64); 5] = [(1, 120), (2, 300), (5, 600), (10, 1200), (20, 3600)];
     
    pub fn new(video_info: &VideoInfo, paths: &'a VideoPathStructure, size: u32) -> io::Result<Self> {
        let vtt_path = paths.root_thumbnails_tvtt();
        let vtt = VttThumbnails::new(&vtt_path)?;
        
        let (w, h) = utils::resized_dimensions(video_info.w, video_info.h, size);

        Ok(Self {
            width: w,
            height: h,
            seconds_interval: ClockTime::from_nseconds(0),
            thumbnails_count: 0,
            vtt,
            paths,
            buffers: Vec::with_capacity((Self::VIDEO_THUMBNAILS_COLS * Self::VIDEO_THUMBNAILS_ROWS) as usize)
        })
    }

    fn assign_best_interval(&mut self, duration: &ClockTime) {
        for (interval, secs) in Self::INTERVALS {
            if duration.seconds() <= secs {
                self.seconds_interval = ClockTime::from_seconds(interval);
                return;
            }
        }

        let (_, interval) = Self::INTERVALS[Self::INTERVALS.len() -1];
        self.seconds_interval = ClockTime::from_seconds(interval);
    }

    pub fn create_thumbnails(&mut self) -> anyhow::Result<String> {
        let pipeline = Pipeline::new();

        let filesrc = ElementFactory::make("filesrc").build()?;
        let decodebin = ElementFactory::make("decodebin").build()?;
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

        pipeline.add_many(&[&filesrc, &decodebin, &videoscale, &videoconvert, &capsfilter, &appsink])?;

        filesrc.link(&decodebin)?;
        videoscale.link(&videoconvert)?;
        videoconvert.link(&capsfilter)?;
        capsfilter.link(&appsink)?;
        decodebin.connect_pad_added(move |_, src_pad| {
            let sink_pad = videoscale.static_pad("sink").unwrap();
            if !sink_pad.is_linked() {
                src_pad.link(&sink_pad).unwrap();
            }
        });

        pipeline.set_state(State::Playing)?;

        let mut frame_count = 0;
        let mut pos = ClockTime::from_seconds(0);
        let appsink = appsink.dynamic_cast::<AppSink>().unwrap();

        let bus = pipeline.bus().unwrap();
        bus.timed_pop_filtered(Some(ClockTime::from_seconds(5)), &[
            MessageType::AsyncDone,
            MessageType::Error,
        ]);

        let duration = pipeline.query_duration::<ClockTime>().ok_or(std::io::Error::new(ErrorKind::Other, "no duration"))?;
        self.assign_best_interval(&duration);

        while pos + self.seconds_interval < duration {
            pipeline.seek_simple(SeekFlags::FLUSH | SeekFlags::ACCURATE, pos)?;
            bus.timed_pop_filtered(Some(ClockTime::from_seconds(5)), &[
                MessageType::AsyncDone,
                MessageType::Error,
            ]);

            let sample = match appsink.pull_sample() {
                Ok(s) => s,
                Err(_) => {
                    frame_count += 1;
                    pos = ClockTime::from_seconds(frame_count * self.seconds_interval.seconds());
                    continue;
                }
            };
            let buffer = sample.buffer().unwrap();
            let map = buffer.map_readable()?;
            let img_buf = map.as_slice().to_vec();
            
            if img_buf.len() == (self.width * self.height * 4) as usize {
                self.buffers.push((img_buf, pos));
            }
            
            if self.buffers.len() == (Self::VIDEO_THUMBNAILS_COLS * Self::VIDEO_THUMBNAILS_ROWS) as usize {
                self.combine_image_buffers()?; // self.buffers.clear() is called
            }

            frame_count += 1;
            pos = ClockTime::from_seconds(frame_count * self.seconds_interval.seconds());
        }

        if self.buffers.len() > 0 {
            self.combine_image_buffers()?;
        }

        pipeline.set_state(State::Null)?;
        Ok(self.paths.public(&self.paths.root_thumbnails_tvtt()))
    }

    fn combine_image_buffers(&mut self) -> image::ImageResult<()> {
        let total_width = self.width * Self::VIDEO_THUMBNAILS_COLS;
        let total_height = self.height * Self::VIDEO_THUMBNAILS_ROWS;

        let mut final_image: RgbaImage = ImageBuffer::new(total_width, total_height);
        let final_data = final_image.as_flat_samples_mut().samples;

        let image_name = self.paths.root_thumbnails_nwebp_image_name(self.thumbnails_count);

        let row_stride = self.width as usize * 4;
        for (i, (buffer, t)) in self.buffers.iter().enumerate() {
            let i = i as u32;

            let x_offset = (i % Self::VIDEO_THUMBNAILS_ROWS) * self.width;
            let y_offset = (i / Self::VIDEO_THUMBNAILS_COLS) * self.height;

            for row in 0..self.height {
                let dest_start = (((y_offset + row) * total_width + x_offset) * 4) as usize;
                let src_start = row as usize * row_stride;
                let src_end = src_start + row_stride;

                final_data[dest_start..dest_start + row_stride]
                    .copy_from_slice(&buffer[src_start..src_end]);
            }        

            self.vtt.write_thumbnail(*t, *t + self.seconds_interval, &image_name, x_offset, y_offset, self.width, self.height)?;
        }

        let image_path = self.paths.root_thumbnails_nwebp(&image_name);

        let final_image = DynamicImage::ImageRgba8(final_image);
        let webp_image = webp::Encoder::from_image(&final_image)
            .map_err(|e| io::Error::new(ErrorKind::Other, e))?
            .encode(90.0);

        let mut webp_file = File::create(image_path)?;
        webp_file.write(&webp_image)?;
    
        self.thumbnails_count += 1;
        self.buffers.clear();    

        Ok(())
    }
}