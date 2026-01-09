use std::sync::Arc;

use futures::StreamExt;
use lapin::{BasicProperties, Channel, message::Delivery, options::{BasicAckOptions, BasicConsumeOptions, BasicNackOptions, BasicPublishOptions, QueueDeclareOptions}, types::FieldTable};
use tokio::sync::Notify;

use crate::{amqp::{messages::ProcessImageSteps}, error::{LocalErr, LocalErrKind, LocalResult, MapErrPrint}};

pub struct ImageQueue {
    channel: Channel,
    ctrl_c: Arc<Notify>
}

impl ImageQueue {
    pub async fn new(channel: Channel, ctrl_c: Arc<Notify>) -> Self {
        Self { channel, ctrl_c }
    }

    async fn send_update(&self, msg: &ProcessImageSteps) -> LocalResult<()> {
        let msg = serde_json::to_vec(msg)
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;
        
        self.channel
            .basic_publish(
                "",
                "image.updates",
                BasicPublishOptions::default(),
                &msg,
                BasicProperties::default()
            )
            .await
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?
            .await
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, 500))?;

        Ok(())
    }

    pub async fn consume_messages(self) -> lapin::Result<()> {
        self.channel.queue_declare("image", QueueDeclareOptions::default(), FieldTable::default()).await?;

        let mut consumer = self.channel.basic_consume(
            "image",
            "c_media_processing",
            BasicConsumeOptions::default(),
            FieldTable::default()
        ).await?;

        println!("Waiting for image tasks");

        loop {
            tokio::select! {
                _ = self.ctrl_c.notified() => {
                    println!("Image queue received shutdown signal, stopping...");
                    break;
                }
                msg = consumer.next() => {
                    if msg.is_none() {
                        break;
                    }
                    if let Some(Ok(delivery)) = msg {
                        match self.process_message(&delivery).await {
                            Ok(_) => {
                                delivery.ack(BasicAckOptions::default()).await?;
                            },
                            Err(err) => {
                                let requeue = err.should_requeue();
                                let options = BasicNackOptions {
                                    requeue,
                                    ..Default::default()
                                };

                                delivery
                                    .nack(options)
                                    .await?;

                                let _ = self.send_update(&ProcessImageSteps::Error { error: err }).await;
                            }
                        } 
                    }
                }
            }
        }

        Ok(())
    }

    pub async fn process_message(&self, delivery: &Delivery) -> LocalResult<()> {
        

        Ok(())
    }
}