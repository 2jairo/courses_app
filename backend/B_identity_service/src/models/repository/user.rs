use sea_orm::{ActiveModelTrait, ColumnTrait, Condition, DatabaseConnection, EntityTrait, QueryFilter};

use crate::{error::{LocalResult, MapErrPrint}, models::entity::user};


#[derive(Clone)]
pub struct UserRepository {
    db: DatabaseConnection
}

impl UserRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    pub async fn get_user_by(&self, filters: Condition) -> LocalResult<Option<user::Model>> {
        let condition = Condition::all()
            .add(user::Column::IsActive.eq(true))
            .add(filters);

            user::Entity::find()
            .filter(condition)
            .one(&self.db)
            .await
            .map_err_print(|e| e.into())
    }

    pub async fn insert_user(&self, user: user::ActiveModel) -> LocalResult<user::Model> {
        user.insert(&self.db).await.map_err_print(|e| e.into())
    }
}