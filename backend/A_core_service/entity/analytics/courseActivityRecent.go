package analytics

import "time"

type CourseActivitySource string

const (
	CourseActivitySourceView     CourseActivitySource = "view"
	CourseActivitySourcePurchase CourseActivitySource = "purchase"
	CourseActivitySourceReview   CourseActivitySource = "review"
)

type CourseActivityRecent struct {
	CreatedAt time.Time
	CourseID  int64
	Source    CourseActivitySource
}

func (CourseActivityRecent) TableName() string {
	return "course_activity_recent"
}
