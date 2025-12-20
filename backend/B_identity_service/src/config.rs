use std::env;

use once_cell::sync::Lazy;

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
    pub postgres_url: String,
    pub socket: String,
}
impl Config {
    fn new() -> Self {
        Self {
            rabbitmq_url: get_string("RABBITMQ_URL"),
            postgres_url: get_string("POSTGRES_URL"),
            socket: get_string("LISTEN_SOCKET"),
        }
    }
}

pub const CONFIG: Lazy<Config> = Lazy::new(Config::new);