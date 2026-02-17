package analytics

import (
	"database/sql/driver"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
)

type CourseViewsDeviceType string
type CourseViewsSource string

const (
	CourseViewsDeviceTypeDesktop CourseViewsDeviceType = "Desktop"
	CourseViewsDeviceTypeMobile  CourseViewsDeviceType = "Mobile"
	CourseViewsDeviceTypeTablet  CourseViewsDeviceType = "Tablet"
	CourseViewsDeviceTypeSmartTv CourseViewsDeviceType = "SmartTv"
	CourseViewsDeviceTypeOther   CourseViewsDeviceType = "Other"
)

func (v CourseViewsDeviceType) IsValid() bool {
	return v == CourseViewsDeviceTypeDesktop ||
		v == CourseViewsDeviceTypeMobile ||
		v == CourseViewsDeviceTypeTablet ||
		v == CourseViewsDeviceTypeSmartTv ||
		v == CourseViewsDeviceTypeOther
}

func (v CourseViewsDeviceType) Value() (driver.Value, error) {
	return string(v), nil
}

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
	Device     CourseViewsDeviceType
	ViewSource CourseViewsSource
	Seen       bool
	UserID     *entitycommon.Id
	UserSex    *entity.UserSex
	BirthDate  *time.Time
}

func (CourseViewsRaw) TableName() string {
	return "course_views_raw"
}
