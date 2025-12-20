use std::time::Duration;
use sea_orm::{Database, DatabaseConnection, DbErr};

use crate::config::CONFIG;

pub async fn connect_db() -> Result<DatabaseConnection, DbErr> {
    let mut options = sea_orm::ConnectOptions::new(&CONFIG.postgres_url);

    options
        .connect_timeout(Duration::from_secs(5))
        .sqlx_logging(false);

    Database::connect(options).await
}

pub async fn close_db(db: DatabaseConnection) -> Result<(), DbErr> {
    db.close().await
}