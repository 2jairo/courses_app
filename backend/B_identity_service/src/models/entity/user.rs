use serde::{Deserialize, Serialize};
use sea_orm::{ActiveValue::Set, entity::prelude::*, prelude::async_trait::async_trait};

use crate::models::entity::common::Password;

#[derive(Default, Debug, Clone, Serialize, Deserialize, EnumIter, DeriveActiveEnum, PartialEq)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "UserSex")]
pub enum UserSex {
    #[sea_orm(string_value = "Male")]
    Male,
    #[sea_orm(string_value = "Female")]
    Female,
    #[sea_orm(string_value = "Other")]
    #[default]
    Other
}

#[derive(DeriveEntityModel, Debug, Clone, Serialize, Deserialize)]
#[sea_orm(table_name = "users")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: uuid::Uuid,
    #[sea_orm(default_expr = "uuid::Uuid::new_v4()")]
    pub version: uuid::Uuid,
    pub email: String,
    pub username: String,
    pub password_hash: Password,
    pub creation_date: DateTimeWithTimeZone,
    pub avatar: Option<String>,
    pub banner: Option<String>,
    pub birth_date: chrono::NaiveDate,
    pub sex: UserSex,
    #[sea_orm(default_value = true)]
    pub is_active: bool
}

#[derive(Clone, Copy, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

#[async_trait]
impl ActiveModelBehavior for ActiveModel {
    async fn before_save<C: ConnectionTrait>(mut self, _db: &C, insert: bool) -> Result<Self, DbErr> {
        if !insert && (self.email.is_set() || self.password_hash.is_set()) {
            self.version = Set(uuid::Uuid::new_v4());
        }
        Ok(self)
    }
}
