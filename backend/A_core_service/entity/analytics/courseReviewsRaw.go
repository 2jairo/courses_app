package analytics

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
)

type CourseReviewsRaw struct {
	CreatedAt time.Time
	CourseID  entitycommon.Id
	UserID    entitycommon.Id
	ReviewId  entitycommon.Id
	IsUpdate  bool
	Rating    int8
}

func (CourseReviewsRaw) TableName() string {
	return "course_reviews_raw"
}
