package analytics

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
)

type TrackCourseViewInput struct {
	CourseId   entitycommon.Id
	UserId     *entitycommon.Id
	UserSex    *entity.UserSex
	DeviceType analytics.CourseViewsDeviceType
	ViewSource analytics.CourseViewsSource
	BirthDate  *time.Time
	Seen       bool
}
