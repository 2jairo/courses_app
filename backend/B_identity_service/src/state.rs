use sea_orm::DatabaseConnection;

use crate::db;

#[derive(Clone)]
pub struct AppState {
    pub pg: DatabaseConnection
}

impl AppState {
    pub async fn new() -> anyhow::Result<Self> {
        let pg = db::postgres::connect_db().await?;

        Ok(Self { pg })
    }

    pub async fn close(self) -> anyhow::Result<()> {
        db::postgres::close_db(self.pg).await?;
        Ok(())
    }
}