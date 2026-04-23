package analytics

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
)

type CoursePurchasesRaw struct {
	CreatedAt time.Time
	CourseID  entitycommon.Id
	UserID    entitycommon.Id
}

func (CoursePurchasesRaw) TableName() string {
	return "course_purchases_raw"
}
