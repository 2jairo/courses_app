
use std::{sync::Arc, time::Duration};

use crate::{
    amqp::messages::{ProcessVideoRequestMessage, ProcessVideoSteps, ProcessVideoStepsSpeechToTextLanguages},
    config::GLOBAL,
    error::{LocalErr, LocalErrKind, LocalResult, MapErrPrint},
    lib::{
        speech_to_text::{LANGUAGES, SpeechToText}, utils::video_path::VideoPathStructure, video_images::{poster_generator::PosterGenerator, thumbnails_generator::ThumbnailsGenerator}, video_info::VideoInfo, video_segment::generator::VideoGenerator
    }, queue::{consumer::QueueConsumer, handler::QueueHandler},
};
use lapin::{Channel, ExchangeKind, options::ExchangeDeclareOptions};
use tokio::sync::Notify;

pub struct VideoQueueHandler;

impl VideoQueueHandler {
    pub fn new() -> Self {
        Self
    }
}

impl QueueHandler for VideoQueueHandler {
    type Message = ProcessVideoRequestMessage;
    type UpdateMessage = ProcessVideoSteps;
    
    fn queue_name(&self) -> &str {
        "video"
    }
    
    fn update_exchange(&self) -> &str {
        "video.updates"
    }
    
    async fn setup(&self, channel: &Channel) -> LocalResult<()> {
        // Declare the updates exchange
        channel
            .exchange_declare(
                self.update_exchange(),
                ExchangeKind::Fanout,
                ExchangeDeclareOptions {
                    durable: true,
                    ..Default::default()
                },
                lapin::types::FieldTable::default(),
            )
            .await
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
        
        Ok(())
    }

    fn create_error_update(&self, error: LocalErr) -> Self::UpdateMessage {
        ProcessVideoSteps::Error { error }
    }
    
    async fn process_message(
        &self,
        channel: &Channel,
        correlation_id: &str,
        message: Self::Message,
        reply_to: &Option<String>,
    ) -> LocalResult<()> {
        let paths = VideoPathStructure::new(message.common.file_path.clone(), message.common.file_id)
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
        
        let video_info = VideoInfo::from_file(paths.raw_file_path())?;
        
        // Send info update
        self.send_update(
            channel,
            correlation_id,
            &ProcessVideoSteps::Info {
                duration: video_info.duration.seconds_f32(),
            },
            reply_to,
        )
        .await?;
        
        // Process resolutions
        {
            let resolutions = VideoGenerator::new(&video_info, &paths);
            let r = resolutions
                .process_resolutions()
                .await
                .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
            
            let msg = ProcessVideoSteps::Resolutions {
                resolutions_framerate: r.resolutions_framerate,
                media_playlist: r.playlist,
            };
            self.send_update(channel, correlation_id, &msg, reply_to)
                .await?;
        }
        
        // Generate poster
        {
            let poster_generator = PosterGenerator::new(&video_info, &paths, 720);
            let poster = poster_generator
                .get_default_poster()
                .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
            self.send_update(
                channel,
                correlation_id,
                &ProcessVideoSteps::Poster { path: poster },
                reply_to,
            )
            .await?;
        }
        
        // Generate thumbnails
        {
            let mut thumbnail_generator =
                ThumbnailsGenerator::new(&video_info, &paths, 90)
                    .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
            let path = thumbnail_generator
                .create_thumbnails()
                .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
            self.send_update(
                channel,
                correlation_id,
                &ProcessVideoSteps::Thumbnails { path },
                reply_to,
            )
            .await?;
        }
        
        // Speech to text
        if video_info.a_bitrate.is_some() {
            let mut audio_to_text = SpeechToText::new(&GLOBAL.whisper_ctx, &paths)
                .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
            audio_to_text
                .load_file()
                .map_err_print(|_| LocalErr::new(LocalErrKind::InvalidVideoFormat, 400))?;
            
            let native_lang_id = audio_to_text
                .detect_language()
                .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
            let native_lang_str = whisper_rs::get_lang_str(native_lang_id)
                .ok_or(LocalErr::new(LocalErrKind::Code500, 500))?;
            
            let mut languages = Vec::with_capacity(LANGUAGES.len());
            
            for lang in LANGUAGES {
                let file_path = audio_to_text
                    .transcript(lang)
                    .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
                languages.push(ProcessVideoStepsSpeechToTextLanguages {
                    language: lang.to_string(),
                    path: file_path,
                    native: native_lang_str == lang,
                });
            }
            
            self.send_update(
                channel,
                correlation_id,
                &ProcessVideoSteps::SpeechToText { languages },
                reply_to,
            )
            .await?;
        } else {
            self.send_update(
                channel,
                correlation_id,
                &ProcessVideoSteps::SpeechToText { languages: vec![] },
                reply_to,
            )
            .await?;
        }
        
        Ok(())
    }
}

pub async fn create_video_queue_handler(notify: Arc<Notify>) -> tokio::task::JoinHandle<()> {
    let video_consumer = QueueConsumer::new(
        VideoQueueHandler::new(),
        notify.clone()
    ).with_reconnect_settings(10, Duration::from_secs(10));
    
    tokio::spawn(async move {
        video_consumer
            .run()
            .await
            .expect("Error on video queue");
    })
}