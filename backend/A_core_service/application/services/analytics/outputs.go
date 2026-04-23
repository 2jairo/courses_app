package analytics

import "github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"

type GetCourseAnalyticsOutput struct {
	Stats                    *analytics.CourseStats
	UniqueViewsPerWeek       []analytics.CourseViewsUnique
	DailyViewsAndImpressions []analytics.CourseViewsDaily
	ViewsByTrafficSource     []analytics.CourseViewsByTrafficSource
	ViewsByViewerSex         []analytics.CourseViewsByViewerSex
	ViewsByAgeRange          []analytics.CourseViewsByAgeRange
	ViewsByDevice            []analytics.CourseViewsByDevice
	LectureAnalytics         []analytics.CourseLectureAnalytics
	SearchQueries            []analytics.CourseSearchQueries
	SearchQueriesRecent      []analytics.CourseSearchQueriesRecent
}
