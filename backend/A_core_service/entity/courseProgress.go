package entity

import (
	"time"

	"gorm.io/gorm"
)

type CourseProgress struct {
	CreatedAt time.Time      `gorm:"type:timestamptz;not null;default:now()"`
	DeletedAt gorm.DeletedAt `gorm:"type:timestamptz"`

	UserID    int64 `gorm:"not null;type:bigint;primaryKey"`
	CourseID  int64 `gorm:"not null;type:bigint;primaryKey"`
	LectureID int64 `gorm:"not null;type:bigint;primaryKey"`

	Lecture Lecture
	User    User
	Course  Course
}

func (CourseProgress) TableName() string {
	return "course_progress"
}
