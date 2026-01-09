use crate::{amqp::{conn::AmqpConnection, image::ImageQueue, video::VideoQueue}, ctrl_c::ctrl_c_gracefull_shutdown};

mod lib;
mod config;
mod amqp;
mod ctrl_c;
mod error;

#[tokio::main]
async fn main() {
    let env_file = if cfg!(debug_assertions) {
        ".env.development"
    } else {
        ".env.production"
    };
    dotenv::from_filename(env_file).ok();
    gstreamer::init().ok();

    let conn = AmqpConnection::connect()
        .await
        .expect("Failed to initialize amqp connection");

    let notify = ctrl_c_gracefull_shutdown();

    let videos_channel = conn.conn.create_channel().await.expect("Failed to initialize video queue");
    let videos_notify = notify.clone();
    let videos_handle = tokio::spawn(async move {
        VideoQueue::new(videos_channel, videos_notify)
            .await
            .consume_messages()
            .await
            .expect("Error on video queue");
    });

    let images_channel = conn.conn.create_channel().await.expect("Failed to initialize image queue");
    let images_notify = notify.clone();
    let images_handle = tokio::spawn(async move {
        ImageQueue::new(images_channel, images_notify)
            .await
            .consume_messages()
            .await
            .expect("Error on image queue");
    });

    for h in [videos_handle, images_handle] {
        let _ = h.await;
    }
}