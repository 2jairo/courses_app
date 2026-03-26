package entity

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type FavoriteCourse struct {
	CreatedAt time.Time      `gorm:"type:timestamptz;not null;default:now()"`
	UpdatedAt time.Time      `gorm:"type:timestamptz;not null;default:now()"`
	DeletedAt gorm.DeletedAt `gorm:"type:timestamptz"`

	UserID   entitycommon.Id `gorm:"primaryKey"`
	CourseID entitycommon.Id `gorm:"primaryKey"`

	User   *User   `gorm:"foreignKey:UserID"`
	Course *Course `gorm:"foreignKey:CourseID"`
}

func (FavoriteCourse) TableName() string {
	return "favorite_courses"
}

type FavoriteCoursePreloadOptions struct {
	User   bool
	Course bool
}

func (p *FavoriteCoursePreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.User {
		query.Preload(prefix + "User")
	}
	if p.Course {
		query.Preload(prefix + "Course")
	}
}
