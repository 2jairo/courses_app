package analytics

import "time"

type CourseViewsUnique struct {
	ViewDate    time.Time
	CourseID    int64
	UniqueUsers uint64
}

func (CourseViewsUnique) TableName() string {
	return "course_views_unique_aggregated"
}
