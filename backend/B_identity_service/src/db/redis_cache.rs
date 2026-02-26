use redis::aio::MultiplexedConnection;

use crate::config::CONFIG;

pub async fn connect_db() -> Result<MultiplexedConnection, redis::RedisError> {
    let client = redis::Client::open(CONFIG.redis_url.as_str())?;
    client.get_multiplexed_async_connection().await
}