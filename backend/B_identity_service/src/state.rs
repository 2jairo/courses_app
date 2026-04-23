use redis::aio::MultiplexedConnection;
use sea_orm::DatabaseConnection;

use crate::{db, models::repository::user::UserRepository, utils::{client_jwt::ClientJwtRepository, ip_info::IpInfoWrapper, s2s_jwt::S2SJwtRepository}};

#[derive(Clone)]
pub struct DatabasesConnection {
    pub pg: DatabaseConnection,
    pub rd: MultiplexedConnection,
    pub stripe: stripe::Client,
}
impl DatabasesConnection {
    pub async fn new() -> anyhow::Result<Self> {
        let pg = db::postgres::connect_db().await?;
        let rd = db::redis_cache::connect_db().await?;
        let stripe = db::stripe::connect().await;

        Ok(Self {
            pg,
            rd,
            stripe,
        })
    }

    pub async fn close(self) -> anyhow::Result<()> {
        db::postgres::close_db(self.pg).await?;
        // redis auto close
        Ok(())
    }
}

#[derive(Clone)]
pub struct AppState {
    pub users_service: UserRepository,
    pub jwt_service: ClientJwtRepository,
    pub s2s_jwt_service: S2SJwtRepository,
    pub ip_info: IpInfoWrapper,
}

impl AppState {
    pub async fn new(dbs: DatabasesConnection) -> anyhow::Result<Self> {
        Ok(Self {
            users_service: UserRepository::new(dbs.clone()),
            jwt_service: ClientJwtRepository::new(dbs),
            s2s_jwt_service: S2SJwtRepository,
            ip_info: IpInfoWrapper::new(),
        })
    }

    // pub async fn close(self) -> anyhow::Result<()> {
    //     self.dbs.close().await
    // }
}