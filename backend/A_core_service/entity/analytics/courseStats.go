package analytics

type CourseStats struct {
	CourseID           int64
	AvgRating          float64
	TotalReviews       uint64
	TotalPurchases     uint64
	TotalViews         uint64
	TotalImpressions   uint64
	TotalUniqueViewers uint64
}

func (CourseStats) TableName() string {
	return "course_stats"
}
