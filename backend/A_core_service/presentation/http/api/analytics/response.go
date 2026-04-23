package analytics

import (
	analyticsservice "github.com/2jairo/courses_app/backend/A_core_service/application/services/analytics"
)

type GetCourseAnalyticsStatsResponse struct {
	CourseID           int64   `json:"courseId"`
	AvgRating          float64 `json:"avgRating"`
	TotalReviews       uint64  `json:"totalReviews"`
	TotalPurchases     uint64  `json:"totalPurchases"`
	TotalViews         uint64  `json:"totalViews"`
	TotalImpressions   uint64  `json:"totalImpressions"`
	TotalUniqueViewers uint64  `json:"totalUniqueViewers"`
}

type CompactObjectResponse struct {
	Fields []string `json:"fields"`
	Values []any    `json:"values"`
}

type CompactTableResponse struct {
	Fields []string `json:"fields"`
	Rows   [][]any  `json:"rows"`
}

type GetCourseAnalyticsCompactResponse struct {
	Stats                    GetCourseAnalyticsStatsResponse `json:"stats"`
	UniqueViewsPerWeek       CompactTableResponse            `json:"uniqueViewsPerWeek"`
	DailyViewsAndImpressions CompactTableResponse            `json:"dailyViewsAndImpressions"`
	ViewsByTrafficSource     CompactTableResponse            `json:"viewsByTrafficSource"`
	ViewsByViewerSex         CompactTableResponse            `json:"viewsByViewerSex"`
	ViewsByAgeRange          CompactTableResponse            `json:"viewsByAgeRange"`
	ViewsByDevice            CompactTableResponse            `json:"viewsByDevice"`
	LectureAnalytics         CompactTableResponse            `json:"lectureAnalytics"`
	SearchQueries            CompactTableResponse            `json:"searchQueries"`
	SearchQueriesRecent      CompactTableResponse            `json:"searchQueriesRecent"`
}

func (self *GetCourseAnalyticsRequest) getResponse(output *analyticsservice.GetCourseAnalyticsOutput) *GetCourseAnalyticsCompactResponse {
	uniqueViewsPerWeek := make([][]any, len(output.UniqueViewsPerWeek))
	for i, item := range output.UniqueViewsPerWeek {
		uniqueViewsPerWeek[i] = []any{item.ViewDate, item.CourseID, item.UniqueUsers}
	}

	dailyViewsAndImpressions := make([][]any, len(output.DailyViewsAndImpressions))
	for i, item := range output.DailyViewsAndImpressions {
		dailyViewsAndImpressions[i] = []any{item.ViewDate, item.CourseID, item.Impressions, item.Views}
	}

	viewsByTrafficSource := make([][]any, len(output.ViewsByTrafficSource))
	for i, item := range output.ViewsByTrafficSource {
		viewsByTrafficSource[i] = []any{item.ViewSource, item.Views}
	}

	viewsByViewerSex := make([][]any, len(output.ViewsByViewerSex))
	for i, item := range output.ViewsByViewerSex {
		viewsByViewerSex[i] = []any{item.UserSex, item.Views}
	}

	viewsByAgeRange := make([][]any, len(output.ViewsByAgeRange))
	for i, item := range output.ViewsByAgeRange {
		viewsByAgeRange[i] = []any{item.AgeRange, item.Views}
	}

	viewsByDevice := make([][]any, len(output.ViewsByDevice))
	for i, item := range output.ViewsByDevice {
		viewsByDevice[i] = []any{item.Device, item.Views}
	}

	lectureAnalytics := make([][]any, len(output.LectureAnalytics))
	for i, item := range output.LectureAnalytics {
		lectureAnalytics[i] = []any{item.LectureID, item.Views, item.ViewSeconds}
	}

	searchQueries := make([][]any, len(output.SearchQueries))
	for i, item := range output.SearchQueries {
		searchQueries[i] = []any{item.Query, item.Mode, item.Seen, item.SearchCount, item.LastSearched}
	}

	searchQueriesRecent := make([][]any, len(output.SearchQueriesRecent))
	for i, item := range output.SearchQueriesRecent {
		searchQueriesRecent[i] = []any{item.Query, item.Mode, item.Seen, item.Count, item.LastSearched}
	}

	return &GetCourseAnalyticsCompactResponse{
		Stats: GetCourseAnalyticsStatsResponse{
			CourseID:           output.Stats.CourseID,
			AvgRating:          output.Stats.AvgRating,
			TotalReviews:       output.Stats.TotalReviews,
			TotalPurchases:     output.Stats.TotalPurchases,
			TotalViews:         output.Stats.TotalViews,
			TotalImpressions:   output.Stats.TotalImpressions,
			TotalUniqueViewers: output.Stats.TotalUniqueViewers,
		},
		UniqueViewsPerWeek: CompactTableResponse{
			Fields: []string{"viewDate", "courseId", "uniqueUsers"},
			Rows:   uniqueViewsPerWeek,
		},
		DailyViewsAndImpressions: CompactTableResponse{
			Fields: []string{"viewDate", "courseId", "impressions", "views"},
			Rows:   dailyViewsAndImpressions,
		},
		ViewsByTrafficSource: CompactTableResponse{
			Fields: []string{"viewSource", "views"},
			Rows:   viewsByTrafficSource,
		},
		ViewsByViewerSex: CompactTableResponse{
			Fields: []string{"userSex", "views"},
			Rows:   viewsByViewerSex,
		},
		ViewsByAgeRange: CompactTableResponse{
			Fields: []string{"ageRange", "views"},
			Rows:   viewsByAgeRange,
		},
		ViewsByDevice: CompactTableResponse{
			Fields: []string{"device", "views"},
			Rows:   viewsByDevice,
		},
		LectureAnalytics: CompactTableResponse{
			Fields: []string{"lectureId", "views", "viewSeconds"},
			Rows:   lectureAnalytics,
		},
		SearchQueries: CompactTableResponse{
			Fields: []string{"query", "mode", "seen", "searchCount", "lastSearched"},
			Rows:   searchQueries,
		},
		SearchQueriesRecent: CompactTableResponse{
			Fields: []string{"query", "mode", "seen", "count", "lastSearched"},
			Rows:   searchQueriesRecent,
		},
	}
}
