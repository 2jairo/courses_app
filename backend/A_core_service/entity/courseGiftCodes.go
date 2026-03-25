package entity

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type CourseGiftCode struct {
	entitycommon.Model
	OrderID    entitycommon.Id  `gorm:"type:bigint;not null"`
	CourseID   entitycommon.Id  `gorm:"type:bigint;not null"`
	Code       string           `gorm:"type:varchar(50);not null;unique"`
	RedeemedAt *time.Time       `gorm:"type:timestamp"`
	RedeemedBy *entitycommon.Id `gorm:"type:bigint"`

	// relations
	Order        *Order  `gorm:"foreignKey:OrderID"`
	Course       *Course `gorm:"foreignKey:CourseID"`
	RedeemedUser *User   `gorm:"foreignKey:RedeemedBy"`
}

func (CourseGiftCode) TableName() string {
	return "course_gift_codes"
}

type CourseGiftCodePreloadOptions struct {
	Order  bool
	Course bool
	CoursePreloadOptions
	RedeemedUser bool
}

func (p *CourseGiftCodePreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.Order {
		query.Preload(prefix + "Order")
	}
	if p.Course {
		query.Preload(prefix + "Course")
		p.CoursePreloadOptions.Preload(query, prefix+"Course.")
	}
	if p.RedeemedUser {
		query.Preload(prefix + "RedeemedUser")
	}
}
