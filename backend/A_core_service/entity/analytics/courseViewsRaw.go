package analytics

import (
	"database/sql/driver"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
)

type CourseViewsSource string

const (
	CourseViewsSourceSearch         CourseViewsSource = "Search"
	CourseViewsSourceRecommendation CourseViewsSource = "Recommendation"
	CourseViewsSourceDirect         CourseViewsSource = "Direct"
	CourseViewsSourceExternal       CourseViewsSource = "External"
	CourseViewsSourceCategory       CourseViewsSource = "Category"
)

func (v CourseViewsSource) IsValid() bool {
	return v == CourseViewsSourceSearch ||
		v == CourseViewsSourceRecommendation ||
		v == CourseViewsSourceDirect ||
		v == CourseViewsSourceExternal ||
		v == CourseViewsSourceCategory
}

// Value implements driver.Valuer interface
func (v CourseViewsSource) Value() (driver.Value, error) {
	return string(v), nil
}

type CourseViewsRaw struct {
	CreatedAt  time.Time
	CourseID   entitycommon.Id
	Device     entitycommon.DeviceType
	ViewSource CourseViewsSource
	Seen       bool
	UserID     *entitycommon.Id
	UserSex    *entity.UserSex
	BirthDate  *time.Time
}

func (CourseViewsRaw) TableName() string {
	return "course_views_raw"
}
