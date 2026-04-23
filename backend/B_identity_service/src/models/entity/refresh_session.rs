use serde::{Deserialize, Serialize};
use sea_orm::{ActiveValue::Set, entity::prelude::*, prelude::async_trait::async_trait};
use utoipa::ToSchema;

use crate::models::entitycommon::token_hash::TokenHash;

use super::user;

#[derive(Default, Debug, Clone, Copy, Serialize, Deserialize, EnumIter, DeriveActiveEnum, PartialEq, ToSchema)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "DeviceType")]
pub enum DeviceType {
    #[sea_orm(string_value = "Desktop")]
    Desktop,
    #[sea_orm(string_value = "Mobile")]
    Mobile,
    #[sea_orm(string_value = "Tablet")]
    Tablet,
    #[sea_orm(string_value = "SmartTv")]
    SmartTv,
    #[sea_orm(string_value = "Other")]
    #[default]
    Other,
}

#[derive(Default, Debug, Clone, Copy, Serialize, Deserialize, EnumIter, DeriveActiveEnum, PartialEq, ToSchema)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "BrowserType")]
pub enum BrowserType {
    #[sea_orm(string_value = "Chrome")]
    Chrome,
    #[sea_orm(string_value = "Safari")]
    Safari,
    #[sea_orm(string_value = "Firefox")]
    Firefox,
    #[sea_orm(string_value = "Edge")]
    Edge,
    #[sea_orm(string_value = "InternetExplorer")]
    InternetExplorer,
    #[sea_orm(string_value = "Opera")]
    Opera,
    #[sea_orm(string_value = "Brave")]
    Brave,
    #[sea_orm(string_value = "Other")]
    #[default]
    Other,
}

#[derive(Default, Debug, Clone, Copy, Serialize, Deserialize, EnumIter, DeriveActiveEnum, PartialEq, ToSchema)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "OperatingSystem")]
pub enum OperatingSystem {
    #[sea_orm(string_value = "Windows")]
    Windows,
    #[sea_orm(string_value = "MacOS")]
    MacOS,
    #[sea_orm(string_value = "IOS")]
    IOS,
    #[sea_orm(string_value = "Android")]
    Android,
    #[sea_orm(string_value = "Linux")]
    Linux,
    #[sea_orm(string_value = "ChromeOS")]
    ChromeOS,
    #[sea_orm(string_value = "Other")]
    #[default]
    Other,
}

#[derive(DeriveEntityModel, Debug, Clone, Serialize, Deserialize)]
#[sea_orm(table_name = "refresh_sessions")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i64,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
    pub deleted_at: Option<DateTimeWithTimeZone>,

    pub user_id: i64,
    pub family_id: String,
    pub device: DeviceType,
    pub os: OperatingSystem,
    pub browser: BrowserType,
    pub token_hash: TokenHash,
    pub session_version: i32,
    pub revoked: bool,
    pub ip: String,
    pub city: String,
    pub country: String,
}

#[derive(Clone, Copy, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "user::Entity",
        from = "Column::UserId",
        to = "user::Column::Id",
        on_delete = "Cascade"
    )]
    User,
}

impl Related<user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

#[async_trait]
impl ActiveModelBehavior for ActiveModel {
    async fn before_save<C: ConnectionTrait>(mut self, _db: &C, _insert: bool) -> Result<Self, DbErr> {
        self.updated_at = Set(
            chrono::Utc::now().with_timezone(&chrono::FixedOffset::east_opt(0).unwrap())
        );
        Ok(self)
    }
}

