use std::sync::Arc;

use futures::StreamExt;
use lapin::{BasicProperties, Channel, ExchangeKind, message::Delivery, options::{BasicAckOptions, BasicConsumeOptions, BasicPublishOptions, BasicRejectOptions, ExchangeDeclareOptions, QueueDeclareOptions}, types::FieldTable};
use tokio::sync::Notify;

use crate::{amqp::{messages::{ProcessVideoRequestMessage, ProcessVideoSteps}}, config::GLOBAL, error::{LocalErr, LocalErrKind, LocalResult, MapErrPrint}, lib::{speech_to_text::{LANGUAGES, SpeechToText}, utils::paths::VideoPathStructure, video_images::{poster_generator::PosterGenerator, thumbnails_generator::ThumbnailsGenerator}, video_info::VideoInfo, video_segment::generator::VideoGenerator}};

pub struct VideoQueue {
    channel: Channel,
    ctrl_c: Arc<Notify>
}

impl VideoQueue {
    pub async fn new(channel: Channel, ctrl_c: Arc<Notify>) -> Self {
        Self { channel, ctrl_c }
    }

    async fn send_update(&self, correlation_id: impl Into<String>, msg: &ProcessVideoSteps) -> LocalResult<()> {
        let msg = serde_json::to_vec(msg)
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
        
        self.channel
            .basic_publish(
                "video.updates",
                "",
                BasicPublishOptions::default(),
                &msg,
                BasicProperties::default().with_correlation_id(correlation_id.into().into())
            )
            .await
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?
            .await
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;

        Ok(())
    }

    pub async fn consume_messages(self) -> lapin::Result<()> {
        self.channel.queue_declare("video", QueueDeclareOptions::default(), FieldTable::default()).await?;
        self.channel.exchange_declare("video.updates", ExchangeKind::Fanout, ExchangeDeclareOptions::default(), FieldTable::default()).await?;

        let mut consumer = self.channel.basic_consume(
            "video",
            "c_media_processing",
            BasicConsumeOptions::default(),
            FieldTable::default()
        ).await?;

        println!("Waiting for video tasks");

        loop {
            tokio::select! {
                _ = self.ctrl_c.notified() => {
                    println!("video queue received shutdown signal, stopping...");
                    break;
                }
                msg = consumer.next() => {
                    if msg.is_none() {
                        println!("video queue Disconnected");
                        break;
                    }
                    if let Some(Ok(delivery)) = msg {
                        let correlation_id = match delivery.properties.correlation_id() {
                            Some(c) => c.to_string(),
                            None => {
                                delivery.reject(BasicRejectOptions::default()).await?;
                                continue
                            }
                        };

                        match self.process_message(&correlation_id, &delivery).await {
                            Ok(_) => {
                                delivery.ack(BasicAckOptions::default()).await?;
                            },
                            Err(err) => {
                                let _ = self.send_update(&correlation_id, &ProcessVideoSteps::Error { error: err }).await;
                                delivery.reject(BasicRejectOptions::default()).await?;
                            }
                        } 
                    } 
                }
            }
        }
    
        Ok(())
    }

    pub async fn process_message(&self, correlation_id: &String, delivery: &Delivery) -> LocalResult<()> {
        let data: ProcessVideoRequestMessage = serde_json::from_slice(&delivery.data)
            .map_err_print(|_| LocalErr::new(LocalErrKind::InvalidMessageFormat, 400))?;

        let paths = VideoPathStructure::new(data.file_path.clone(), data.file_id)
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;

        let video_info = VideoInfo::from_file(paths.raw_file_path())?;
        self.send_update(correlation_id, &ProcessVideoSteps::Info { duration: video_info.duration.seconds_f32() }).await?;

        {
            let resolutions = VideoGenerator::new(&video_info, &paths);
            let r = resolutions
                .process_resolutions()
                .await
                .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
            self.send_update(correlation_id, &ProcessVideoSteps::Resolutions { resolutions_framerate: r }).await?;
        }
        {
            let poster_generator = PosterGenerator::new(&video_info, &paths, 720);
            let poster = poster_generator
                .get_default_poster()
                .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
            self.send_update(correlation_id, &ProcessVideoSteps::Poster { path: poster }).await?;
        }
        {
            let mut thumbnail_generator = ThumbnailsGenerator::new(&video_info, &paths, 90)
                .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
            let path = thumbnail_generator
                .create_thumbnails()
                .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
            self.send_update(correlation_id, &ProcessVideoSteps::Thumbnails { path }).await?;
        }
        {
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
    
            for lang in LANGUAGES {
                audio_to_text
                    .transcript(lang)
                    .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;       
            }
            let languages = LANGUAGES.iter().map(|s|s.to_string()).collect::<Vec<_>>();
            self.send_update(correlation_id, &ProcessVideoSteps::SpeechToText { 
                languages,
                native: native_lang_str.to_string() 
            }).await?;  
        }

        Ok(())
    }
}