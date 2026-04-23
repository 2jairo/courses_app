use serde::{Deserialize, Serialize};
use sea_orm::entity::prelude::*;
use utoipa::ToSchema;

use crate::extract::ParsedUserAgent;

use super::user;

pub type EntityId = i64;

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct NotificationTypeLectureCommentReplyMetadata {
    pub course_id: EntityId,
    pub parent_comment_id: EntityId,
    pub reply_id: EntityId,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct NotificationTypeLectureCommentReplyStaffMetadata {
    pub course_id: EntityId,
    pub parent_comment_id: EntityId,
    pub reply_id: EntityId,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct NotificationTypeCoursePermissionGrantedMetadata {
    pub course_id: EntityId,
    pub role: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct NotificationTypeCoursePermissionRevokedMetadata {
    pub course_id: EntityId,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct NotificationTypeCourseVisibilityUpdatedMetadata {
    pub course_id: EntityId,
    pub visibility: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct NotificationTypeLecturePublishedMetadata {
    pub course_id: EntityId,
    pub lecture_id: EntityId,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct NotificationTypeOrderStatusUpdatedMetadata {
    pub order_id: EntityId,
    pub order_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct NotificationTypeSessionNewLocationMetadata {
    pub ip: String,
    pub location: String,
    pub ua: ParsedUserAgent
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct NotificationTypeCourseDiscountAvailableMetadata {
    pub course_id: EntityId,
    pub discount_percent: i32,
    pub valid_until: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct NotificationTypeCourseMaterialUpdatedMetadata {
    pub course_id: EntityId,
    pub section_id: EntityId,
    pub update_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct NotificationTypeQuizScoreAvailableMetadata {
    pub course_id: EntityId,
    pub lecture_id: EntityId,
    pub quiz_id: EntityId,
    pub score: i32,
    pub max_score: i32,
    pub passed: bool,
}

#[derive(Default, Debug, Clone, Copy, Serialize, Deserialize, EnumIter, DeriveActiveEnum, PartialEq, Eq, ToSchema)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "NotificationType")]
pub enum NotificationType {
    #[sea_orm(string_value = "LectureCommentReply")]
    LectureCommentReply,
    #[sea_orm(string_value = "LectureCommentReplyFromStaff")]
    LectureCommentReplyFromStaff,
    #[sea_orm(string_value = "CoursePermissionGranted")]
    CoursePermissionGranted,
    #[sea_orm(string_value = "CoursePermissionRevoked")]
    CoursePermissionRevoked,
    #[sea_orm(string_value = "CoursePublished")]
    CoursePublished,
    #[sea_orm(string_value = "LecturePublished")]
    LecturePublished,
    #[sea_orm(string_value = "CoursePaymentReceived")]
    CoursePaymentReceived,
    #[sea_orm(string_value = "CourseReviewReceived")]
    CourseReviewReceived,
    #[sea_orm(string_value = "SessionNewLocation")]
    SessionNewLocation,
    #[sea_orm(string_value = "CourseDiscountAvailable")]
    CourseDiscountAvailable,
    #[sea_orm(string_value = "CourseMaterialUpdated")]
    CourseMaterialUpdated,
    #[sea_orm(string_value = "QuizScoreAvailable")]
    #[default]
    QuizScoreAvailable,
}

#[derive(DeriveEntityModel, Debug, Clone, Serialize, Deserialize)]
#[sea_orm(table_name = "notifications")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i64,
    pub created_at: DateTimeWithTimeZone,
    pub deleted_at: Option<DateTimeWithTimeZone>,

    pub user_id: i64,
    pub notification_type: NotificationType,
    pub actor_id: Option<i64>,
    pub seen: bool,
    pub seen_at: Option<DateTimeWithTimeZone>,
    pub metadata: Json,
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
    #[sea_orm(
        belongs_to = "user::Entity",
        from = "Column::ActorId",
        to = "user::Column::Id",
        on_delete = "SetNull"
    )]
    Actor,
}

impl Related<user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}