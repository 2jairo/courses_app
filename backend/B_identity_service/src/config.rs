use std::{env, str::FromStr};

use chrono::Duration;
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

fn get_number<F: FromStr>(key: &str) -> F {
    env::var(key)
        .unwrap_or_else(|_| panic!("Environment variable `{}` is not set", key))
        .parse()
        .unwrap_or_else(|_| panic!("Invalid usize value for `{}`", key))
}


pub struct Config {
    pub rabbitmq_url: String,
    pub postgres_url: String,
    pub socket: String,
    pub jwt_access_secret: String,
    pub jwt_access_exp_time: Duration,
    pub jwt_refresh_secret: String,
    pub jwt_refresh_exp_time: Duration,
    pub jwt_refresh_cookie_name: String,
    pub jwt_domain: String,
}
impl Config {
    fn new() -> Self {
        Self {
            rabbitmq_url: get_string("RABBITMQ_URL"),
            postgres_url: get_string("POSTGRES_URL"),
            socket: get_string("LISTEN_SOCKET"),
            jwt_access_secret: get_string("JWT_ACCESS_SECRET"),
            jwt_access_exp_time: Duration::hours(get_number("JWT_ACCESS_HOURS")),
            jwt_refresh_secret: get_string("JWT_REFRESH_SECRET"),
            jwt_refresh_exp_time: Duration::hours(get_number("JWT_REFRESH_HOURS")),
            jwt_refresh_cookie_name: "refresh_token".to_string(),
            jwt_domain: get_string("JWT_DOMAIN"),
        }
    }
}

pub const CONFIG: Lazy<Config> = Lazy::new(Config::new);