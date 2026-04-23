package analytics

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
)

type LectureViewsRaw struct {
	CreatedAt   time.Time
	LectureID   entitycommon.Id
	UserID      *entitycommon.Id
	Device      entitycommon.DeviceType
	UserSex     *entity.UserSex
	ViewSeconds uint32
}

func (LectureViewsRaw) TableName() string {
	return "lecture_views_raw"
}
