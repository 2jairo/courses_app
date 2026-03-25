package entity

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type CoursePurchase struct {
	CreatedAt time.Time      `gorm:"type:timestamptz;not null;default:now()"`
	DeletedAt gorm.DeletedAt `gorm:"type:timestamptz"`

	UserID   entitycommon.Id `gorm:"type:bigint;primaryKey"`
	CourseID entitycommon.Id `gorm:"type:bigint;primaryKey"`

	// relations
	User   *User   `gorm:"foreignKey:UserID"`
	Course *Course `gorm:"foreignKey:CourseID"`
}

func (CoursePurchase) TableName() string {
	return "course_purchases"
}

type CoursePurchasePreloadOptions struct {
	User   bool
	Course bool
	CoursePreloadOptions
}

func (p *CoursePurchasePreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.User {
		query.Preload(prefix + "User")
	}
	if p.Course {
		query.Preload(prefix + "Course")
		p.CoursePreloadOptions.Preload(query, prefix+"Course.")
	}
}
