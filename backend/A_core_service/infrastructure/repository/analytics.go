package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
)

type AnalyticsRepository struct {
	Db *db.DatabasesConnection
}

func (self *AnalyticsRepository) Create(model interface{}, entity interface{}) error {
	return self.Db.Ch.
		Model(model).
		Create(entity).
		Error
}

func (self *AnalyticsRepository) FindOneCourseStats(findBy *analytics.CourseStats) error {
	query := self.Db.Ch.Model(&analytics.CourseStats{}).Where(findBy)
	return query.First(findBy).Error
}

func (self *AnalyticsRepository) FindTopSearchQueriesByPrefix(prefix string, limit int) ([]analytics.CourseSearchQueriesRecent, error) {
	var results []analytics.CourseSearchQueriesRecent
	err := self.Db.Ch.
		Model(&analytics.CourseSearchQueriesRecent{}).
		Select("query, any(mode) as mode, sum(count) as count, max(last_searched) as last_searched").
		Where("query LIKE ?", prefix+"%").
		Group("query").
		Order("count DESC, last_searched DESC").
		Limit(limit).
		Find(&results).Error
	return results, global.Err(err)
}

func (self *AnalyticsRepository) FindCourseUniqueViewersPerWeek(courseId entitycommon.Id) ([]analytics.CourseViewsUnique, error) {
	var results []analytics.CourseViewsUnique

	query := self.Db.Ch.
		Model(&analytics.CourseViewsUnique{}).
		Where(&analytics.CourseViewsUnique{CourseID: int64(courseId)}).
		Order("view_date ASC")

	err := query.Find(&results).Error
	return results, global.Err(err)
}

func (self *AnalyticsRepository) FindCourseDailyViewsAndImpressions(courseId entitycommon.Id) ([]analytics.CourseViewsDaily, error) {
	var results []analytics.CourseViewsDaily

	err := self.Db.Ch.
		Model(&analytics.CourseViewsDaily{}).
		Where("course_id = ?", int64(courseId)).
		Order("view_date ASC").
		Find(&results).
		Error

	return results, global.Err(err)
}

func (self *AnalyticsRepository) FindCourseViewsByTrafficSource(courseId entitycommon.Id) ([]analytics.CourseViewsByTrafficSource, error) {
	var results []analytics.CourseViewsByTrafficSource

	err := self.Db.Ch.
		Model(&analytics.CourseViewsAggregated{}).
		Select("view_source, sum(views) as views").
		Where("course_id = ?", int64(courseId)).
		Group("view_source").
		Order("views DESC").
		Find(&results).
		Error

	return results, global.Err(err)
}

func (self *AnalyticsRepository) FindCourseViewsByViewerSex(courseId entitycommon.Id) ([]analytics.CourseViewsByViewerSex, error) {
	var results []analytics.CourseViewsByViewerSex

	err := self.Db.Ch.
		Model(&analytics.CourseViewsAggregated{}).
		Select("user_sex, sum(views) as views").
		Where("course_id = ?", int64(courseId)).
		Group("user_sex").
		Order("views DESC").
		Find(&results).
		Error

	return results, global.Err(err)
}

func (self *AnalyticsRepository) FindCourseViewsByAgeRange(courseId entitycommon.Id) ([]analytics.CourseViewsByAgeRange, error) {
	var results []analytics.CourseViewsByAgeRange

	err := self.Db.Ch.
		Model(&analytics.CourseViewsAggregated{}).
		Select("age_range, sum(views) as views").
		Where("course_id = ?", int64(courseId)).
		Group("age_range").
		Order("age_range ASC").
		Find(&results).
		Error

	return results, global.Err(err)
}

func (self *AnalyticsRepository) FindCourseViewsByDevice(courseId entitycommon.Id) ([]analytics.CourseViewsByDevice, error) {
	var results []analytics.CourseViewsByDevice

	err := self.Db.Ch.
		Model(&analytics.CourseViewsAggregated{}).
		Select("device, sum(views) as views").
		Where("course_id = ?", int64(courseId)).
		Group("device").
		Order("views DESC").
		Find(&results).
		Error

	return results, global.Err(err)
}

func (self *AnalyticsRepository) FindCourseSearchQueries(courseId entitycommon.Id, limit int) ([]analytics.CourseSearchQueries, error) {
	var results []analytics.CourseSearchQueries

	err := self.Db.Ch.
		Model(&analytics.CourseSearchQueries{}).
		Where("course_id = ?", int64(courseId)).
		Order("search_count DESC").
		Limit(limit).
		Find(&results).
		Error

	return results, global.Err(err)
}

func (self *AnalyticsRepository) FindCourseSearchQueriesRecent(courseId entitycommon.Id, limit int) ([]analytics.CourseSearchQueriesRecent, error) {
	var results []analytics.CourseSearchQueriesRecent

	err := self.Db.Ch.
		Model(&analytics.CourseSearchQueriesRecent{}).
		Where("course_id = ?", int64(courseId)).
		Order("count DESC").
		Limit(limit).
		Find(&results).
		Error

	return results, global.Err(err)
}

func (self *AnalyticsRepository) FindCourseLectureIDs(courseId entitycommon.Id) ([]int64, error) {
	var lectureIDs []int64

	err := self.Db.Pg.
		Table("lectures").
		Joins("JOIN course_sections ON course_sections.id = lectures.course_section_id").
		Where("course_sections.course_id = ?", int64(courseId)).
		Pluck("lectures.id", &lectureIDs).
		Error

	return lectureIDs, global.Err(err)
}

func (self *AnalyticsRepository) FindCourseLectureAnalytics(courseId entitycommon.Id) ([]analytics.CourseLectureAnalytics, error) {
	lectureIDs, err := self.FindCourseLectureIDs(courseId)
	if err != nil {
		return nil, global.Err(err)
	}

	if len(lectureIDs) == 0 {
		return []analytics.CourseLectureAnalytics{}, nil
	}

	var results []analytics.CourseLectureAnalytics
	err = self.Db.Ch.
		Model(&analytics.LectureViewsAggregated{}).
		Select("lecture_id, sum(views) as views, sum(view_seconds) as view_seconds").
		Where("lecture_id IN ?", lectureIDs).
		Group("lecture_id").
		Order("views DESC").
		Find(&results).
		Error

	return results, global.Err(err)
}
