use sea_orm::{ActiveModelTrait, ActiveValue::Set, ColumnTrait, Condition, EntityTrait, QueryFilter};
use stripe::{CreateCustomer, Customer};

use crate::{error::{LocalErr, LocalResult, MapErrPrint}, models::entity::user, state::DatabasesConnection};


#[derive(Clone)]
pub struct UserRepository {
    dbs: DatabasesConnection
}

impl UserRepository {
    pub fn new(dbs: DatabasesConnection) -> Self {
        Self { dbs }
    }

    pub async fn find(&self, filters: Condition) -> LocalResult<Vec<user::Model>> {
        let condition = Condition::all()
            .add(user::Column::DeletedAt.is_null())
            .add(filters);

        user::Entity::find()
            .filter(condition)
            .all(&self.dbs.pg)
            .await
            .map_err_print(|e| e.into())
    }

    pub async fn find_one(&self, filters: Condition) -> LocalResult<Option<user::Model>> {
        let condition = Condition::all()
            .add(user::Column::DeletedAt.is_null())
            .add(filters);

        user::Entity::find()
            .filter(condition)
            .one(&self.dbs.pg)
            .await
            .map_err_print(|e| e.into())
    }

    pub async fn insert_user(&self, mut user: user::ActiveModel) -> LocalResult<user::Model> {
        let mut customer = CreateCustomer::default();
        if let Some(mail) = user.email.try_as_ref() {
            customer.email = Some(mail);
        }
        if let Some(username) = user.username.try_as_ref() {
            customer.name = Some(username);
        }

        let c = Customer::create(&self.dbs.stripe, customer)
            .await
            .map_err_print(|e| LocalErr::from(e))?;

        user.stripe_id = Set(c.id.as_str().to_string());
    
        let model = user.insert(&self.dbs.pg).await.map_err_print(|e| LocalErr::from(e))?;
        Ok(model)
    }
}