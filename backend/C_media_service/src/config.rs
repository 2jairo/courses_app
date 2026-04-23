use std::env;

use once_cell::sync::Lazy;
use whisper_rs::{WhisperContext, WhisperContextParameters};

fn get_string(key: &str) -> String {
    env::var(key).unwrap_or_else(|_| {
        panic!("Environment variable `{}` is not set", key)
    })
}

fn get_bool(key: &str) -> bool {
    match env::var(key)
        .unwrap_or_else(|_| panic!("Environment variable `{}` is not set", key))
        .to_lowercase()
        .as_str()
    {
        "1" | "true" | "yes" | "on" => true,
        "0" | "false" | "no" | "off" => false,
        v => panic!(
            "Invalid boolean value for `{}`: `{}` (expected true/false)",
            key, v
        ),
    }
}

fn get_usize(key: &str) -> usize {
    env::var(key)
        .unwrap_or_else(|_| panic!("Environment variable `{}` is not set", key))
        .parse()
        .unwrap_or_else(|_| panic!("Invalid usize value for `{}`", key))
}


pub struct Config {
    pub rabbitmq_url: String,
    pub rabbitmq_consumer_timeout_ms: usize,
    pub whispercpp_model_path: String,
    pub use_gpu: bool,
    pub segment_duration: usize,
    pub processed_files_base_path: String,
    pub raw_files_base_path: String,
    pub nvenc_encode_sessions_limit: usize
}
impl Config {
    fn new() -> Self {
        Self {
            rabbitmq_url: get_string("RABBITMQ_URL"),
            rabbitmq_consumer_timeout_ms: get_usize("RABBITMQ_CONSUMER_TIMEOUT_MS"),
            whispercpp_model_path: get_string("WHISPERCPP_MODEL_PATH"),
            use_gpu: get_bool("USE_GPU"),
            segment_duration: get_usize("SEGMENT_DURATION"),
            processed_files_base_path: get_string("PROCESSED_FILES_BASE_PATH"),
            raw_files_base_path: get_string("RAW_FILES_BASE_PATH"),
            nvenc_encode_sessions_limit: get_usize("NVENC_ENCODE_SESSIONS_LIMIT")
        }
    }
}

pub struct Global {
    pub whisper_ctx: WhisperContext
}
impl Global {
    fn new() -> Self {
        let mut ctx_params = WhisperContextParameters::new();
        ctx_params.use_gpu(CONFIG.use_gpu);

        let ctx = WhisperContext::new_with_params(&CONFIG.whispercpp_model_path, ctx_params)
            .expect("Error creating whisper ctx");

        Self {
            whisper_ctx: ctx
        }
    }
}

pub const CONFIG: Lazy<Config> = Lazy::new(Config::new);
pub const GLOBAL: Lazy<Global> = Lazy::new(Global::new);