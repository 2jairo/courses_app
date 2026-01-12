use anyhow::anyhow;
use gstreamer::{Caps, ClockTime, ElementFactory, Fraction, Pipeline, State, glib::{object::ObjectExt, value::ToValue}, prelude::{ElementExt, ElementExtManual, GObjectExtManualGst, GstBinExt, GstBinExtManual, GstObjectExt, PadExt}};
use tokio::fs;
use crate::{config::CONFIG, lib::{utils::paths::VideoPathStructure, video_info::VideoInfo, video_segment::{media_playlists::MediaPlaylists, resolutions::{ResFrameBitrate, Resolutions}}}};

const NVH265ENC_QP_PROPS: [(&str, &dyn ToValue); 6] = [
    ("qp-min-i", &24),
    ("qp-max-i", &36),
    ("qp-min-p", &26),
    ("qp-max-p", &38),
    ("qp-min-b", &28),
    ("qp-max-b", &40),
];


pub struct VideoGenerator<'a> {
    video_info: &'a VideoInfo,
    paths: &'a VideoPathStructure,
}
impl<'a> VideoGenerator<'a> {
    pub fn new(video_info: &'a VideoInfo, paths: &'a VideoPathStructure) -> Self {
        Self { video_info, paths }
    }

    pub async fn process_resolutions(&self) -> anyhow::Result<Vec<(i32, i32)>> {
        let mut media_playlists = MediaPlaylists::new(&self.paths.root_indexm3u8())?;

        let resolutions = Resolutions::new(self.video_info)
            .into_iter()
            .enumerate()
            .collect::<Vec<_>>();

        let target_resolutions_framerate = resolutions
            .iter()
            .map(|r| (r.1.original_h, r.1.target_framerate))
            .collect::<Vec<_>>();

        let mut r = 0;
        while r < resolutions.len() {
            let encode_sessions_limit = match CONFIG.use_gpu {
                true => CONFIG.nvenc_encode_sessions_limit,
                false => 1
            };

            let len = (r + encode_sessions_limit).min(resolutions.len());
            let chunk = &resolutions[r..len];
            r += len;

            self.parse_resolutions(&mut media_playlists, chunk)
                .await?;
        }

        Ok(target_resolutions_framerate)
    }

    async fn parse_resolutions(
        &self, 
        media_playlists: &mut MediaPlaylists, 
        resolutions: &[(usize, ResFrameBitrate)]
    ) -> anyhow::Result<()> {
        let pipeline = match resolutions.len() {
            1 => {
                let (res_idx, res) = &resolutions[0];
                self.build_single_resolution_pipeline(res, *res_idx)?
            }
            2..=usize::MAX => self.build_multiple_resolutions_pipeline(resolutions)?,
            _ => return Err(anyhow!("No resolutions provided")),
        };

        for (_, res) in resolutions {
            let path = self.paths.root_resolution(res.h, res.target_framerate);
            fs::create_dir_all(path).await?;
        }

        pipeline.set_state(State::Playing)?;

        let bus = pipeline.bus().unwrap();

        let result = loop {
            match bus.timed_pop(ClockTime::from_mseconds(100)) {
                Some(msg) => match msg.view() {
                    gstreamer::MessageView::Eos(_) => {
                        for (res_idx, res) in resolutions.iter() {
                            media_playlists.write_resolution(*res_idx, res)?;
                        }
                        break Ok(());
                    }
                    gstreamer::MessageView::Element(e) => {
                        if let Some(structure) = e.structure() {
                            if structure.name() != "hls-segment-added" {
                                continue;
                            }
                            let Ok(segment_path) = structure.get::<&str>("location") else { continue };
                            let Ok(duration) = structure.get::<u64>("duration") else { continue };
                            let Ok(metadata) = fs::metadata(segment_path).await else { continue };
                            let res_idx = match e.src().map(|elmt| elmt.name().parse::<usize>()) {
                                Some(Ok(n)) => n,
                                _ => continue
                            };
                            media_playlists.add_segment(res_idx, metadata.len(), duration);
                        }
                    }
                    gstreamer::MessageView::Error(e) => {
                        break Err(anyhow!(format!("GStreamer error: {}", e.error())))
                    }
                    _ => {}
                },
                None => continue,
            }
        };

        pipeline.set_state(State::Null)?;
        result
    }

    // Private: single resolution pipeline
    fn build_single_resolution_pipeline(
        &self,
        res: &ResFrameBitrate,
        res_idx: usize,
    ) -> anyhow::Result<Pipeline> {
        let pipeline = Pipeline::new();
        let cpu = !CONFIG.use_gpu;

        let filesrc = ElementFactory::make("filesrc").build()?;
        let decodebin3 = ElementFactory::make("decodebin3").build()?;
        let h265enc = ElementFactory::make(if cpu { "x265enc" } else { "nvh265enc" }).build()?;
        let h265parse = ElementFactory::make("h265parse").build()?;
        let hlssink3 = ElementFactory::make("hlssink3").name(res_idx.to_string()).build()?;
        let videoconvert = ElementFactory::make("videoconvert").build()?;
        let videoscale = ElementFactory::make("videoscale").build()?;
        let videorate = ElementFactory::make("videorate").build()?;
        let capsfilter = ElementFactory::make("capsfilter").build()?;

        let audioconvert = ElementFactory::make("audioconvert").build()?;
        let audioresample = ElementFactory::make("audioresample").build()?;
        let voaacenc = ElementFactory::make("voaacenc").build()?;
        let aacparse = ElementFactory::make("aacparse").build()?;

        // Video caps
        let video_caps = Caps::builder("video/x-raw")
            .field("width", res.w)
            .field("height", res.h)
            .field("framerate", &Fraction::new(res.target_framerate, 1))
            .build();
        capsfilter.set_property("caps", &video_caps);

        // Video encoder properties
        if cpu {
            h265enc.set_property("bitrate", res.v_bitrate);
            h265enc.set_property_from_str("speed-preset", "veryfast");
        } else {
            h265enc.set_property("max-bitrate", res.v_bitrate);
            h265enc.set_property("gop-size", res.target_framerate * CONFIG.segment_duration as i32);
            h265enc.set_property("bframes", 4u32);
            h265enc.set_property("b-adapt", true);
            h265enc.set_property("i-adapt", true);
            h265enc.set_property("spatial-aq", true);
            h265enc.set_property("aq-strength", 8u32);
            h265enc.set_property("temporal-aq", true);
            h265enc.set_property_from_str("rc-mode", "constqp");
            h265enc.set_property_from_str("preset", "hq");
            h265enc.set_property_from_str("tune", "high-quality");
            h265enc.set_property_from_str("multi-pass", "two-pass");
            h265enc.set_properties(&NVH265ENC_QP_PROPS);
        }

        // HLS paths   
        let playlist_location = self.paths.root_resolution_indexm3u8(res.h, res.target_framerate);
        let segment_location = self.paths.root_resolution_segmentts(res.h, res.target_framerate);

        filesrc.set_property("location", self.paths.raw_file_path().as_str());
        hlssink3.set_property("location", segment_location.to_str().unwrap());
        hlssink3.set_property("target-duration", CONFIG.segment_duration as u32);
        hlssink3.set_property("playlist-length", 0u32);
        hlssink3.set_property("max-files", 0u32);
        hlssink3.set_property("playlist-location", playlist_location.to_str().unwrap());
        hlssink3.set_property_from_str("playlist-type", "vod");
        pipeline.set_property("latency", 0u64);

        pipeline.add_many(&[
            &filesrc, &decodebin3, &videoscale, &videorate, &capsfilter, &h265enc, &h265parse,
            &hlssink3, &audioconvert, &audioresample, &voaacenc, &aacparse,
        ])?;

        filesrc.link(&decodebin3)?;
        if cpu {
            pipeline.add(&videoconvert)?;
            videoconvert.link(&videoscale)?;
        }
        videoscale.link(&videorate)?;
        videorate.link(&capsfilter)?;
        capsfilter.link(&h265enc)?;
        h265enc.link(&h265parse)?;

        let video_sink_pad = hlssink3.request_pad_simple("video").unwrap();
        h265parse.static_pad("src").unwrap().link(&video_sink_pad)?;

        if let Some(a_bitrate) = res.a_bitrate {
            audioconvert.link(&audioresample)?;
            audioresample.link(&voaacenc)?;
            voaacenc.link(&aacparse)?;
            voaacenc.set_property("bitrate", a_bitrate);

            let audio_sink_pad = hlssink3.request_pad_simple("audio").unwrap();
            aacparse.static_pad("src").unwrap().link(&audio_sink_pad)?;
        }

        decodebin3.connect_pad_added(move |_, src_pad| {
            let caps_str = src_pad.query_caps(None).to_string();

            if caps_str.contains("audio") {
                let sink_pad = audioconvert.static_pad("sink").unwrap();
                if !sink_pad.is_linked() {
                    src_pad.link(&sink_pad).unwrap();
                }
            } else if caps_str.contains("video") {
                let sink_pad = if cpu {
                    videoconvert.static_pad("sink").unwrap()
                } else {
                    videoscale.static_pad("sink").unwrap()
                };
                if !sink_pad.is_linked() {
                    src_pad.link(&sink_pad).unwrap();
                }
            }
        });

        Ok(pipeline)
    }

    // Private: multiple resolutions pipeline
    fn build_multiple_resolutions_pipeline(
        &self,
        resolutions: &[(usize, ResFrameBitrate)],
    ) -> anyhow::Result<Pipeline> {
        let pipeline = Pipeline::new();

        let filesrc = ElementFactory::make("filesrc").build()?;
        let decodebin3 = ElementFactory::make("decodebin3").build()?;
        let tee_audio = ElementFactory::make("tee").build()?;
        let tee_video = ElementFactory::make("tee").build()?;

        pipeline.set_property("latency", 0u64);
        filesrc.set_property("location", self.paths.raw_file_path().as_str());

        pipeline.add_many(&[&filesrc, &decodebin3, &tee_audio, &tee_video])?;
        filesrc.link(&decodebin3)?;

        for (i, (res_idx, res)) in resolutions.iter().enumerate() {
            let video_queue = ElementFactory::make("queue").build()?;
            let videoscale = ElementFactory::make("videoscale").build()?;
            let videorate = ElementFactory::make("videorate").build()?;
            let capsfilter = ElementFactory::make("capsfilter").build()?;
            let h265enc = ElementFactory::make("nvh265enc").build()?;
            let h265parse = ElementFactory::make("h265parse").build()?;
            let hlssink3 = ElementFactory::make("hlssink3").name(res_idx.to_string()).build()?;

            let audio_queue = ElementFactory::make("queue").build()?;
            let audioconvert = ElementFactory::make("audioconvert").build()?;
            let audioresample = ElementFactory::make("audioresample").build()?;
            let voaacenc = ElementFactory::make("voaacenc").build()?;
            let aacparse = ElementFactory::make("aacparse").build()?;

            let caps = Caps::builder("video/x-raw")
                .field("width", res.w)
                .field("height", res.h)
                .field("framerate", &Fraction::new(res.target_framerate, 1))
                .build();
            capsfilter.set_property("caps", &caps);

            h265enc.set_property("max-bitrate", res.v_bitrate);
            h265enc.set_property("gop-size", res.target_framerate * CONFIG.segment_duration as i32);
            h265enc.set_property("bframes", 4u32);
            h265enc.set_property("b-adapt", true);
            h265enc.set_property("i-adapt", true);
            h265enc.set_property("spatial-aq", true);
            h265enc.set_property("aq-strength", 8u32);
            h265enc.set_property("temporal-aq", true);
            h265enc.set_property_from_str("rc-mode", "constqp");
            h265enc.set_property_from_str("preset", "hq");
            h265enc.set_property_from_str("tune", "high-quality");
            h265enc.set_property_from_str("multi-pass", "two-pass");
            h265enc.set_properties(&NVH265ENC_QP_PROPS);

            let playlist_location = self.paths.root_resolution_indexm3u8(res.h, res.target_framerate);
            let segment_location = self.paths.root_resolution_segmentts(res.h, res.target_framerate);

            hlssink3.set_property("location", segment_location.to_str().unwrap());
            hlssink3.set_property("target-duration", CONFIG.segment_duration as u32);
            hlssink3.set_property("playlist-length", 0u32);
            hlssink3.set_property("max-files", 0u32);
            hlssink3.set_property("playlist-location", playlist_location.to_str().unwrap());
            hlssink3.set_property_from_str("playlist-type", "vod");

            pipeline.add_many(&[
                &video_queue, &videoscale, &videorate, &capsfilter, &h265enc, &h265parse, &hlssink3,
                &audio_queue, &audioconvert, &audioresample, &voaacenc, &aacparse,
            ])?;

            // video
            let video_tee_pad = tee_video.request_pad_simple(&format!("src_{i}")).unwrap();
            video_tee_pad.link(&video_queue.static_pad("sink").unwrap()).unwrap();
            video_queue.link(&videoscale)?;
            videoscale.link(&videorate)?;
            videorate.link(&capsfilter)?;
            capsfilter.link(&h265enc)?;
            h265enc.link(&h265parse)?;
            let video_sink_pad = hlssink3.request_pad_simple("video").unwrap();
            h265parse.static_pad("src").unwrap().link(&video_sink_pad)?;

            // audio
            if let Some(a_bitrate) = res.a_bitrate {
                let audio_tee_pad = tee_audio.request_pad_simple(&format!("src_{i}")).unwrap();
                audio_tee_pad.link(&audio_queue.static_pad("sink").unwrap()).unwrap();
                audio_queue.link(&audioconvert)?;
                audioconvert.link(&audioresample)?;
                audioresample.link(&voaacenc)?;
                voaacenc.link(&aacparse)?;
                voaacenc.set_property("bitrate", a_bitrate);
                let audio_sink_pad = hlssink3.request_pad_simple("audio").unwrap();
                aacparse.static_pad("src").unwrap().link(&audio_sink_pad)?;
            }
        }

        decodebin3.connect_pad_added(move |_, src_pad| {
            let caps_str = src_pad.query_caps(None).to_string();

            if caps_str.contains("audio") {
                let sink_pad = tee_audio.static_pad("sink").unwrap();
                if !sink_pad.is_linked() {
                    src_pad.link(&sink_pad).unwrap();
                }
            } else if caps_str.contains("video") {
                let sink_pad = tee_video.static_pad("sink").unwrap();
                if !sink_pad.is_linked() {
                    src_pad.link(&sink_pad).unwrap();
                }
            }
        });

        Ok(pipeline)
    }

}