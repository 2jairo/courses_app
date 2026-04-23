package entity

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type NotificationType string

const (
	NotificationTypeLectureCommentReply      NotificationType = "LectureCommentReply"          //
	NotificationTypeLectureCommentReplyStaff NotificationType = "LectureCommentReplyFromStaff" //
	NotificationTypeCoursePermissionGranted  NotificationType = "CoursePermissionGranted"      //
	NotificationTypeCoursePermissionRevoked  NotificationType = "CoursePermissionRevoked"      //
	NotificationTypeCourseVisibilityUpdated  NotificationType = "CourseVisibilityUpdated"      //Multiple user
	NotificationTypeLecturePublished         NotificationType = "LecturePublished"             //Multiple user
	NotificationTypeOrderStatusUpdated       NotificationType = "NotificationStatusUpdated"    //
	NotificationTypeSessionNewLocation       NotificationType = "SessionNewLocation"           // Cservice
	NotificationTypeCourseDiscountAvailable  NotificationType = "CourseDiscountAvailable"      // Multiple user
	NotificationTypeCourseMaterialUpdated    NotificationType = "CourseMaterialUpdated"        // Multiple user
	NotificationTypeQuizScoreAvailable       NotificationType = "QuizScoreAvailable"
)

func (n NotificationType) IsValid() bool {
	return n == NotificationTypeLectureCommentReply ||
		n == NotificationTypeLectureCommentReplyStaff ||
		n == NotificationTypeCoursePermissionGranted ||
		n == NotificationTypeCoursePermissionRevoked ||
		n == NotificationTypeCourseVisibilityUpdated ||
		n == NotificationTypeLecturePublished ||
		n == NotificationTypeOrderStatusUpdated ||
		n == NotificationTypeSessionNewLocation ||
		n == NotificationTypeCourseDiscountAvailable ||
		n == NotificationTypeCourseMaterialUpdated ||
		n == NotificationTypeQuizScoreAvailable
}

type Notification struct {
	entitycommon.Model
	UserID           entitycommon.Id
	NotificationType NotificationType `gorm:"type:NotificationType"`
	ActorID          *entitycommon.Id
	Seen             bool           `gorm:"default:false"`
	SeenAt           *time.Time     `gorm:"type:timestamptz"`
	Metadata         datatypes.JSON `gorm:"type:jsonb;default:'{}'::jsonb"`

	// relations
	User  *User `gorm:"foreignKey:UserID"`
	Actor *User `gorm:"foreignKey:ActorID"`
}

type NotificationPreloadOptions struct {
	User  bool
	Actor bool
}

func (p *NotificationPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.User {
		query.Preload(prefix + "User")
	}
	if p.Actor {
		query.Preload(prefix + "Actor")
	}
}
