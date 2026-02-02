package entity

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type CourseProgress struct {
	CreatedAt time.Time      `gorm:"type:timestamptz;not null;default:now()"`
	DeletedAt gorm.DeletedAt `gorm:"type:timestamptz"`

	UserID    entitycommon.Id `gorm:"not null;type:bigint;primaryKey"`
	CourseID  entitycommon.Id `gorm:"not null;type:bigint;primaryKey"`
	LectureID entitycommon.Id `gorm:"not null;type:bigint;primaryKey"`

	Lecture Lecture
	User    User
	Course  Course
}

func (CourseProgress) TableName() string {
	return "course_progress"
}
