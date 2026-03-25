use crate::config::CONFIG;

pub async fn connect() -> stripe::Client {
    stripe::Client::new(CONFIG.stripe_api_sk.as_str())
}