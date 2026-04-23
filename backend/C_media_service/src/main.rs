use crate::{ctrl_c::ctrl_c_gracefull_shutdown, queue::{image_handler::create_image_queue_handler, other_handler::create_other_queue_handler, video_handler::create_video_queue_handler}};

mod lib;
mod config;
mod amqp;
mod ctrl_c;
mod error;
mod queue;

#[tokio::main]
async fn main() {
    let env_file = if cfg!(debug_assertions) {
        ".env.development"
    } else {
        ".env.production"
    };
    tracing_subscriber::fmt::init();
    dotenv::from_filename(env_file).ok();
    gstreamer::init().ok();
    
    let notify = ctrl_c_gracefull_shutdown();
    
    let images_handle = create_image_queue_handler(notify.clone()).await;
    let videos_handle = create_video_queue_handler(notify.clone()).await;
    let other_handle = create_other_queue_handler(notify.clone()).await;
    
    for h in [videos_handle, images_handle, other_handle] {
        let _ = h.await;
    }
}