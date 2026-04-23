package entity

type ClickhouseCourseStatsAmqpMsg struct {
	CourseID         int64   `json:"course_id"`
	AvgRating        float64 `json:"avg_rating"`
	TotalReviews     uint64  `json:"total_reviews"`
	TotalPurchases   uint64  `json:"total_purchases"`
	TotalViews       uint64  `json:"total_views"`
	TotalImpressions uint64  `json:"total_impressions"`
	UpdatedAt        string  `json:"updated_at"`
}
