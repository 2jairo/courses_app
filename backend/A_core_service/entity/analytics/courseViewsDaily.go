package analytics

import "time"

type CourseViewsDaily struct {
	ViewDate    time.Time
	CourseID    int64
	Impressions uint64
	Views       uint64
}

func (CourseViewsDaily) TableName() string {
	return "course_views_daily"
}
