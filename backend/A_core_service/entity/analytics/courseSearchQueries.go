package analytics

import "time"

type CourseSearchQueries struct {
	CourseID     int64
	Query        string
	SearchCound  uint64
	LastSearched time.Time
}
