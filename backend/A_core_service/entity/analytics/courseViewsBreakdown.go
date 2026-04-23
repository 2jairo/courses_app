package analytics

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
)

type CourseViewsByTrafficSource struct {
	ViewSource CourseViewsSource
	Views      uint64
}

type CourseViewsByViewerSex struct {
	UserSex *entity.UserSex
	Views   uint64
}

type CourseViewsByAgeRange struct {
	AgeRange *CourseViewsAgeRange
	Views    uint64
}

type CourseViewsByDevice struct {
	Device entitycommon.DeviceType
	Views  uint64
}
