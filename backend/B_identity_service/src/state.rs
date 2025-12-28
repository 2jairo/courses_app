use sea_orm::DatabaseConnection;

use crate::{db, models::repository::user::UserRepository, utils::{client_jwt::ClientJwtRepository, s2s_jwt::S2SJwtRepository}};

#[derive(Clone)]
pub struct AppState {
    pg: DatabaseConnection,
    pub users_service: UserRepository,
    pub jwt_service: ClientJwtRepository,
    pub s2s_jwt_service: S2SJwtRepository
}

impl AppState{
    pub async fn new() -> anyhow::Result<Self> {
        let pg = db::postgres::connect_db().await?;
        
        Ok(Self {
            users_service: UserRepository::new(pg.clone()),
            jwt_service: ClientJwtRepository,
            s2s_jwt_service: S2SJwtRepository,
            pg,
        })
    }

    pub async fn close(self) -> anyhow::Result<()> {
        db::postgres::close_db(self.pg).await?;
        Ok(())
    }
}