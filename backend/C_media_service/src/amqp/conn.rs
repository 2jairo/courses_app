use lapin::{Connection, ConnectionProperties};
use crate::{config::CONFIG};

pub struct AmqpConnection {
    pub conn: Connection
}

impl AmqpConnection {
    pub async fn connect() -> lapin::Result<Self> {
        let conn = Connection::connect(&CONFIG.rabbitmq_url, ConnectionProperties::default()).await?;

        Ok(Self {
            conn
        })
    }
}