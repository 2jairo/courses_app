use sea_orm::{ActiveModelTrait, ColumnTrait, Condition, EntityTrait, QueryFilter};

use crate::{error::{LocalResult, MapErrPrint}, models::entity::user, state::DatabasesConnection};


#[derive(Clone)]
pub struct UserRepository {
    dbs: DatabasesConnection
}

impl UserRepository {
    pub fn new(dbs: DatabasesConnection) -> Self {
        Self { dbs }
    }

    pub async fn get_user_by(&self, filters: Condition) -> LocalResult<Option<user::Model>> {
        let condition = Condition::all()
            .add(user::Column::IsActive.eq(true))
            .add(filters);

            user::Entity::find()
            .filter(condition)
            .one(&self.dbs.pg)
            .await
            .map_err_print(|e| e.into())
    }

    pub async fn insert_user(&self, user: user::ActiveModel) -> LocalResult<user::Model> {
        user.insert(&self.dbs.pg).await.map_err_print(|e| e.into())
    }
}