package entity

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type CourseReview struct {
	entitycommon.Model
	UpdatedAt time.Time `gorm:"type:timestamptz;not null;default:now()"`

	UserID   entitycommon.Id
	CourseID entitycommon.Id
	Rating   int32
	Comment  string `gorm:"type:text"`

	User   *User   `gorm:"foreignKey:UserID"`
	Course *Course `gorm:"foreignKey:CourseID"`
}

func (CourseReview) TableName() string {
	return "course_reviews"
}

type CourseReviewPreloadOptions struct {
	User   bool
	Course bool
}

func (p *CourseReviewPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.User {
		query.Preload(prefix + "User")
	}
	if p.Course {
		query.Preload(prefix + "Course")
	}
}
