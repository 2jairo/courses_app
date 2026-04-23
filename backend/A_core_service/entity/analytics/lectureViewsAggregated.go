package analytics

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
)

type LectureViewsAggregated struct {
	LectureID   entitycommon.Id
	ViewDate    time.Time
	Device      entitycommon.DeviceType
	UserSex     *entity.UserSex
	Views       uint64
	ViewSeconds uint64
}

func (LectureViewsAggregated) TableName() string {
	return "lecture_views_aggregated"
}
