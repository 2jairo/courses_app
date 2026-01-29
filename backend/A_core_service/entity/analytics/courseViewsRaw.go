package analytics

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
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

type CourseViewsRaw struct {
	CreatedAt       time.Time
	CourseID        int64
	UserID          *int64
	Device          CourseViewsDeviceType
	ViewSource      CourseViewsSource
	DurationSeconds uint32
	Seen            bool
	UserSex         *entity.UserSex
}
