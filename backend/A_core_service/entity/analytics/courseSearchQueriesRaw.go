package analytics

import "time"

type CourseSearchQueriesRaw struct {
	CreatedAt time.Time
	CourseID  int64
	Query     string
	UserID    *int64
}
