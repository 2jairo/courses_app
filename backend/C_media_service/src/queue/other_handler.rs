use std::{sync::Arc, time::Duration};
use crate::{
    amqp::{conn::AmqpConnection, messages::{ProcessOtherRequestMessage, ProcessOtherSteps}}, error::{LocalErr, LocalErrKind, LocalResult, MapErrPrint}, lib::{file_checker::FileChecker, utils::other_path::OtherPathStructure}, queue::{consumer::QueueConsumer, handler::QueueHandler}
};
use lapin::{Channel, ExchangeKind, options::ExchangeDeclareOptions};
use tokio::sync::Notify;

pub struct OtherQueueHandler;

impl OtherQueueHandler {
    pub fn new() -> Self {
        Self
    }
}

impl QueueHandler for OtherQueueHandler {
    type Message = ProcessOtherRequestMessage;
    type UpdateMessage = ProcessOtherSteps;
    
    fn queue_name(&self) -> &str {
        "other"
    }
    
    fn update_exchange(&self) -> &str {
        "other.updates"
    }
    
    async fn setup(&self, channel: &Channel) -> LocalResult<()> {
        // Declare the updates exchange
        channel
            .exchange_declare(
                self.update_exchange(),
                ExchangeKind::Fanout,
                ExchangeDeclareOptions::default(),
                lapin::types::FieldTable::default(),
            )
            .await
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
        
        Ok(())
    }

    fn create_error_update(&self, error: LocalErr) -> Self::UpdateMessage {
        ProcessOtherSteps::Error { error }
    }
    
    async fn process_message(
        &self,
        channel: &Channel,
        correlation_id: &str,
        message: Self::Message,
        reply_to: &Option<String>,
    ) -> LocalResult<()> {
        let paths = OtherPathStructure::new(
            message.common.file_path, 
            message.common.file_id, 
            message.common.original_file_name
        ).map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;

        {
            let file_checker = FileChecker::new(&paths);
            let dest_path = file_checker.save()
                .map_err_print(|_| LocalErr::new(LocalErrKind::StoreOther, 500))?;

            self.send_update(
                channel,
                correlation_id,
                &ProcessOtherSteps::Ok{ path: dest_path },
                reply_to,
            )
            .await?;
        }

        Ok(())
    }
}

pub async fn create_other_queue_handler(conn: &AmqpConnection, notify: Arc<Notify>) -> tokio::task::JoinHandle<()> {
    let other_channel = conn.create_channel()
        .await
        .expect("Failed to create amqp channel");

    let other_consumer = QueueConsumer::new(
        other_channel,
        OtherQueueHandler::new(),
        notify.clone()
    ).with_reconnect_settings(10, Duration::from_secs(10));
    
    tokio::spawn(async move {
        other_consumer
            .run()
            .await
            .expect("Error on other queue");
    })
}