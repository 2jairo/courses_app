use sea_orm::DatabaseConnection;

use crate::{db, models::repository::user::UserRepository, utils::jwt::JwtRepository};

#[derive(Clone)]
pub struct AppState {
    pg: DatabaseConnection,
    pub users_service: UserRepository,
    pub jwt_service: JwtRepository,
}

impl AppState{
    pub async fn new() -> anyhow::Result<Self> {
        let pg = db::postgres::connect_db().await?;
        
        Ok(Self {
            users_service: UserRepository::new(pg.clone()),
            jwt_service: JwtRepository,
            pg,
        })
    }

    pub async fn close(self) -> anyhow::Result<()> {
        db::postgres::close_db(self.pg).await?;
        Ok(())
    }
}