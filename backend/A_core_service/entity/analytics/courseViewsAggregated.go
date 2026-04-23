package analytics

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
)

type CourseViewsAgeRange string

const (
	CourseViewsAgeRange0To17  CourseViewsAgeRange = "0-17"
	CourseViewsAgeRange18To24 CourseViewsAgeRange = "18-24"
	CourseViewsAgeRange25To34 CourseViewsAgeRange = "25-34"
	CourseViewsAgeRange35To44 CourseViewsAgeRange = "35-44"
	CourseViewsAgeRange45To54 CourseViewsAgeRange = "45-54"
	CourseViewsAgeRange55To64 CourseViewsAgeRange = "55-64"
	CourseViewsAgeRange65Plus CourseViewsAgeRange = "65+"
)

type CourseViewsAggregated struct {
	CourseID    entitycommon.Id
	ViewDate    time.Time
	Device      entitycommon.DeviceType
	ViewSource  CourseViewsSource
	UserSex     *entity.UserSex
	AgeRange    *CourseViewsAgeRange
	Impressions uint64
	Views       uint64
}

func (CourseViewsAggregated) TableName() string {
	return "course_views_aggregated"
}
