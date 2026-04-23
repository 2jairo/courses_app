use std::{sync::Arc, time::Duration};

use crate::{
    amqp::messages::{ProcessImageRequestMessage, ProcessImageSteps},
    error::{LocalErr, LocalErrKind, LocalResult, MapErrPrint},
    lib::{
        images::generator::ImageGenerator, utils::image_path::ImagePathStructure,
    }, queue::{consumer::QueueConsumer, handler::QueueHandler},
};
use lapin::{Channel, ExchangeKind, options::ExchangeDeclareOptions};
use tokio::sync::Notify;

pub struct ImageQueueHandler;

impl ImageQueueHandler {
    pub fn new() -> Self {
        Self
    }
}

impl QueueHandler for ImageQueueHandler {
    type Message = ProcessImageRequestMessage;
    type UpdateMessage = ProcessImageSteps;
    
    fn queue_name(&self) -> &str {
        "image"
    }
    
    fn update_exchange(&self) -> &str {
        "image.updates"
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
        ProcessImageSteps::Error { error }
    }
    
    async fn process_message(
        &self,
        channel: &Channel,
        correlation_id: &str,
        message: Self::Message,
        reply_to: &Option<String>,
    ) -> LocalResult<()> {
        let paths = ImagePathStructure::new(message.common.file_path.clone(), message.common.file_id)
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
        
        let img_generator = ImageGenerator::new(&paths)?;
        let resolutions = img_generator.process_resolutions()?;
        
        self.send_update(
            channel,
            correlation_id,
            &ProcessImageSteps::Resolutions { resolutions },
            reply_to,
        )
        .await?;
        
        Ok(())
    }
}


pub async fn create_image_queue_handler(notify: Arc<Notify>) -> tokio::task::JoinHandle<()> {
    let image_consumer = QueueConsumer::new(
        ImageQueueHandler::new(),
        notify.clone()
    ).with_reconnect_settings(10, Duration::from_secs(10));

    tokio::spawn(async move {
        image_consumer
            .run()
            .await
            .expect("Error on image queue");
    })
}