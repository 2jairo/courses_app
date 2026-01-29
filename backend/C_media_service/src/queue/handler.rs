use lapin::{
    BasicProperties, Channel, 
    options::BasicPublishOptions
};
use crate::error::{LocalErr, LocalErrKind, LocalResult, MapErrPrint};

pub trait QueueHandler: Send + Sync {
    type Message: serde::de::DeserializeOwned + Send + Sync;
    type UpdateMessage: serde::Serialize + Send + Sync;
    
    /// Get the queue name for this handler
    fn queue_name(&self) -> &str;
    
    /// Get the consumer tag for this handler
    fn consumer_tag(&self) -> &str {
        "c_media_processing"
    }
    
    /// Optional: declare any exchanges or additional queues needed
    async fn setup(&self, channel: &Channel) -> LocalResult<()> {
        Ok(())
    }
    
    /// Process a single message
    async fn process_message(
        &self,
        channel: &Channel,
        correlation_id: &str,
        message: Self::Message,
        reply_to: &Option<String>,
    ) -> LocalResult<()>;
    
    /// Create an error update message
    fn create_error_update(&self, error: LocalErr) -> Self::UpdateMessage;
    
    /// Send an update message
    async fn send_update(
        &self,
        channel: &Channel,
        correlation_id: &str,
        msg: &Self::UpdateMessage,
        reply_to: &Option<String>,
    ) -> LocalResult<()> {
        let msg_bytes = serde_json::to_vec(msg)
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
        
        let (exchange, routing_key) = match reply_to {
            Some(reply_queue) => ("", reply_queue.as_str()),
            None => (self.update_exchange(), "")
        };
        
        channel
            .basic_publish(
                exchange,
                routing_key,
                BasicPublishOptions::default(),
                &msg_bytes,
                BasicProperties::default()
                    .with_correlation_id(correlation_id.into()),
            )
            .await
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?
            .await
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
        
        Ok(())
    }
    
    /// Get the exchange name for updates (if any)
    fn update_exchange(&self) -> &str {
        ""
    }
}