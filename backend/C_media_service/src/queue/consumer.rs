use std::{sync::Arc, time::Duration};

use futures::{FutureExt, StreamExt};
use lapin::{Channel, message::Delivery, options::{BasicAckOptions, BasicConsumeOptions, BasicRejectOptions, QueueDeclareOptions}, types::FieldTable};
use tokio::sync::Notify;
use tracing::{error, warn, info};

use crate::{error::{LocalErr, LocalErrKind, LocalResult}, queue::handler::QueueHandler};

pub struct QueueConsumer<H: QueueHandler> {
    channel: Channel,
    handler: H,
    ctrl_c: Arc<Notify>,
    max_reconnect_attempts: usize,
    reconnect_delay: Duration,
}

impl<H: QueueHandler> QueueConsumer<H> {
    pub fn new(
        channel: Channel,
        handler: H,
        ctrl_c: Arc<Notify>,
    ) -> Self {
        Self {
            channel,
            handler,
            ctrl_c,
            max_reconnect_attempts: 10, // Maximum reconnection attempts
            reconnect_delay: Duration::from_secs(5), // Delay between reconnections
        }
    }
    
    pub fn with_reconnect_settings(
        mut self,
        max_reconnect_attempts: usize,
        reconnect_delay: Duration,
    ) -> Self {
        self.max_reconnect_attempts = max_reconnect_attempts;
        self.reconnect_delay = reconnect_delay;
        self
    }
    
    pub async fn run(&self) -> LocalResult<()> {
        let mut reconnect_attempt = 0;
        
        loop {
            if self.ctrl_c.notified().now_or_never().is_some() {
                info!("Shutdown signal received before connection attempt");
                break Ok(());
            }
            
            match self.connect_and_consume().await {
                Ok(_) => {
                    info!("{} consumer finished gracefully", self.handler.queue_name());
                    break Ok(());
                }
                Err(err) => {
                    error!("{} consumer error: {:?}", self.handler.queue_name(), err);
                    
                    reconnect_attempt += 1;
                    
                    if reconnect_attempt >= self.max_reconnect_attempts {
                        error!("Max reconnection attempts reached for {}", self.handler.queue_name());
                        break Err(err);
                    }
                    
                    warn!(
                        "Reconnecting {} in {:?} (attempt {}/{})",
                        self.handler.queue_name(),
                        self.reconnect_delay,
                        reconnect_attempt,
                        self.max_reconnect_attempts
                    );
                    
                    tokio::select! {
                        _ = tokio::time::sleep(self.reconnect_delay) => continue,
                        _ = self.ctrl_c.notified() => {
                            info!("Shutdown during reconnection delay");
                            break Ok(());
                        }
                    }
                }
            }
        }
    }
    
    async fn connect_and_consume(&self) -> LocalResult<()> {        
        // Set up queue and exchanges
        self.handler.setup(&self.channel).await?;
        
        // Declare the main queue
        self.channel
            .queue_declare(
                self.handler.queue_name(),
                QueueDeclareOptions::default(),
                FieldTable::default(),
            )
            .await
            .map_err(|e| {
                error!("Failed to declare queue: {}", e);
                LocalErr::new(LocalErrKind::Code500, 500)
            })?;
        
        // Start consuming
        let mut consumer = self.channel
            .basic_consume(
                self.handler.queue_name(),
                self.handler.consumer_tag(),
                BasicConsumeOptions::default(),
                FieldTable::default(),
            )
            .await
            .map_err(|e| {
                error!("Failed to start consumer: {}", e);
                LocalErr::new(LocalErrKind::Code500, 500)
            })?;
        
        info!("Waiting for {} tasks", self.handler.queue_name());
        loop {
            tokio::select! {
                _ = self.ctrl_c.notified() => {
                    info!("{} consumer received shutdown signal", self.handler.queue_name());
                    
                    // Close the channel gracefully
                    let _ = self.channel.close(200, "Shutting down").await;
                    
                    break Ok(());
                }
                msg = consumer.next() => {
                    match msg {
                        Some(Ok(delivery)) => {
                            self.process_delivery(&self.channel, delivery).await;
                        }
                        Some(Err(err)) => {
                            error!("Error receiving message: {}", err);
                            // Continue to next message
                        }
                        None => {
                            // Consumer disconnected
                            warn!("{} consumer disconnected, will reconnect", self.handler.queue_name());
                            break Err(LocalErr::new(LocalErrKind::Code500, 500));
                        }
                    }
                }
            }
        }
    }
    
    async fn process_delivery(&self, channel: &Channel, delivery: Delivery) {
        let correlation_id = match delivery.properties.correlation_id() {
            Some(c) => c.to_string(),
            None => {
                let _ = delivery.reject(BasicRejectOptions::default()).await;
                return;
            }
        };
        
        let reply_to = delivery
            .properties
            .reply_to()
            .as_ref()
            .map(|r| r.to_string());
        
        // Parse the message
        let message: H::Message = match serde_json::from_slice(&delivery.data) {
            Ok(msg) => msg,
            Err(err) => {
                error!("Failed to parse message: {}", err);
                let error_msg = self.handler.create_error_update(LocalErr::new(LocalErrKind::InvalidMessageFormat, 400));
                let _ = self.handler.send_update(channel, &correlation_id, &error_msg, &reply_to).await;
                let _ = delivery.reject(BasicRejectOptions::default()).await;
                return;
            }
        };
        
        // Process the message
        match self
            .handler
            .process_message(channel, &correlation_id, message, &reply_to)
            .await
        {
            Ok(_) => {
                if let Err(e) = delivery.ack(BasicAckOptions::default()).await {
                    error!("Failed to ack message: {}", e);
                }
            }
            Err(err) => {
                error!("Error processing message: {:?}", err);
                
                // Send error update
                let error_update = self.handler.create_error_update(err);
                let _ = self
                    .handler
                    .send_update(channel, &correlation_id, &error_update, &reply_to)
                    .await;
                
                // Reject the message (don't requeue)
                let _ = delivery.reject(BasicRejectOptions::default()).await;
            }
        }
    }
}