use gstreamer::{
    Caps, ClockTime, ElementFactory, Pipeline, State,
    glib::object::{Cast, ObjectExt},
    prelude::{ElementExt, ElementExtManual, GstBinExtManual, PadExt},
};

use crate::lib::utils::video_path::VideoPathStructure;


pub struct AudioExtractor<'a> {
    paths: &'a VideoPathStructure,
}

impl<'a> AudioExtractor<'a> {
    pub fn new(paths: &'a VideoPathStructure) -> Self {
        Self { paths }
    }

    pub fn extract_audio(&self) -> anyhow::Result<Vec<f32>> {
        let pipeline = Pipeline::new();

        let filesrc = ElementFactory::make("filesrc").build()?;
        let decodebin = ElementFactory::make("decodebin").build()?;
        let audioconvert = ElementFactory::make("audioconvert").build()?;
        let audioresample = ElementFactory::make("audioresample").build()?;
        let capsfilter = ElementFactory::make("capsfilter").build()?;
        let appsink = ElementFactory::make("appsink").build()?;

        let caps = Caps::builder("audio/x-raw")
            .field("format", "F32LE")
            .field("rate", 16_000i32)
            .field("channels", 1i32)
            .build();

        filesrc.set_property("location", self.paths.raw_file_path().as_str());
        capsfilter.set_property("caps", &caps);
        appsink.set_property("sync", false);
        appsink.set_property("drop", false);
        appsink.set_property("max-buffers", 0u32);

        pipeline.add_many(&[
            &filesrc,
            &decodebin,
            &audioconvert,
            &audioresample,
            &capsfilter,
            &appsink,
        ])?;

        filesrc.link(&decodebin)?;
        audioconvert.link(&audioresample)?;
        audioresample.link(&capsfilter)?;
        capsfilter.link(&appsink)?;

        let audioconvert_clone = audioconvert.clone();
        decodebin.connect_pad_added(move |_, src_pad| {
            let caps_str = src_pad.current_caps()
                .map(|c| c.to_string())
                .unwrap_or_default();
            
            if caps_str.contains("audio") {
                let sink_pad = audioconvert_clone.static_pad("sink").unwrap();
                if !sink_pad.is_linked() {
                    let _ = src_pad.link(&sink_pad);
                }
            }
        });

        pipeline.set_state(State::Playing)?;

        let mut audio_samples = Vec::new();
        let appsink = appsink.dynamic_cast::<gstreamer_app::AppSink>().unwrap();
        let bus = pipeline.bus().unwrap();

        // Process messages and collect samples
        loop {
            if let Some(msg) = bus.timed_pop(ClockTime::from_mseconds(100)) {
                match msg.view() {
                    gstreamer::MessageView::Eos(_) => break,
                    gstreamer::MessageView::Error(err) => {
                        pipeline.set_state(State::Null)?;
                        return Err(anyhow::anyhow!("Pipeline error: {}", err.error()));
                    }
                    _ => {}
                }
            }

            while let Ok(sample) = appsink.pull_sample() {
                if let Some(buffer) = sample.buffer() {
                    if let Ok(map) = buffer.map_readable() {
                        let data = map.as_slice();
                        
                        // Convert bytes to f32 samples
                        for chunk_bytes in data.chunks_exact(4) {
                            let sample = f32::from_le_bytes(chunk_bytes.try_into().unwrap());
                            audio_samples.push(sample);
                        }
                    }
                }
            }
        }

        pipeline.set_state(State::Null)?;

        Ok(audio_samples)
    }
}