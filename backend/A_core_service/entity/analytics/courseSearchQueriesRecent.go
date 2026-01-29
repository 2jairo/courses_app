package analytics

import "time"

type CourseSearchQueriesRecent struct {
	CourseID          int64
	Query             string
	SearchCound       uint64
	LastSearchedState time.Time
	LastSearched      time.Time
}
