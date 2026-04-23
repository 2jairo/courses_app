package analytics

import (
	"errors"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"gorm.io/gorm"
)

type AnalyticsService struct {
	Repo *infrastructure.AppRepositories
}

func (s *AnalyticsService) TrackCourseView(input TrackCourseViewInput) error {
	// Verify course exists
	course := &entity.Course{Model: entitycommon.Model{ID: input.CourseId}}
	if err := s.Repo.Course.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
		return global.Err(err)
	}

	view := &analytics.CourseViewsRaw{
		CourseID:   input.CourseId,
		Device:     input.DeviceType,
		ViewSource: input.ViewSource,
		UserSex:    input.UserSex,
		UserID:     input.UserId,
		BirthDate:  input.BirthDate,
		Seen:       input.Seen,
	}

	return s.Repo.Analytics.Create(&analytics.CourseViewsRaw{}, view)
}

func (s *AnalyticsService) TrackLectureView(input TrackLectureViewInput) error {
	lecture := &entity.Lecture{Model: entitycommon.Model{ID: input.LectureId}}
	if err := s.Repo.Lecture.FindOne(lecture, entity.LecturePreloadOptions{}); err != nil {
		return global.Err(err)
	}

	view := &analytics.LectureViewsRaw{
		LectureID:   input.LectureId,
		Device:      input.DeviceType,
		UserSex:     &input.UserSex,
		UserID:      &input.UserId,
		ViewSeconds: input.ViewSeconds,
	}

	return s.Repo.Analytics.Create(&analytics.LectureViewsRaw{}, view)
}

func (s *AnalyticsService) GetCourseStats(input GetCourseStatsInput) (*analytics.CourseStats, error) {
	stats := &analytics.CourseStats{
		CourseID: int64(input.CourseID),
	}

	if err := s.Repo.Analytics.FindOneCourseStats(stats); err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, global.Err(err)
	}

	return stats, nil
}

func (s *AnalyticsService) GetCourseAnalytics(input GetCourseAnalyticsInput) (*GetCourseAnalyticsOutput, error) {
	stats := &analytics.CourseStats{
		CourseID: int64(input.CourseID),
	}

	if err := s.Repo.Analytics.FindOneCourseStats(stats); err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, global.Err(err)
	}

	uniqueViewsPerWeek, err := s.Repo.Analytics.FindCourseUniqueViewersPerWeek(input.CourseID)
	if err != nil {
		return nil, global.Err(err)
	}

	dailyViewsAndImpressions, err := s.Repo.Analytics.FindCourseDailyViewsAndImpressions(input.CourseID)
	if err != nil {
		return nil, global.Err(err)
	}

	viewsByTrafficSource, err := s.Repo.Analytics.FindCourseViewsByTrafficSource(input.CourseID)
	if err != nil {
		return nil, global.Err(err)
	}

	viewsByViewerSex, err := s.Repo.Analytics.FindCourseViewsByViewerSex(input.CourseID)
	if err != nil {
		return nil, global.Err(err)
	}

	viewsByAgeRange, err := s.Repo.Analytics.FindCourseViewsByAgeRange(input.CourseID)
	if err != nil {
		return nil, global.Err(err)
	}

	viewsByDevice, err := s.Repo.Analytics.FindCourseViewsByDevice(input.CourseID)
	if err != nil {
		return nil, global.Err(err)
	}

	lectureAnalytics, err := s.Repo.Analytics.FindCourseLectureAnalytics(input.CourseID)
	if err != nil {
		return nil, global.Err(err)
	}

	searchQueries, err := s.Repo.Analytics.FindCourseSearchQueries(input.CourseID, 10)
	if err != nil {
		return nil, global.Err(err)
	}

	searchQueriesRecent, err := s.Repo.Analytics.FindCourseSearchQueriesRecent(input.CourseID, 10)
	if err != nil {
		return nil, global.Err(err)
	}

	return &GetCourseAnalyticsOutput{
		Stats:                    stats,
		UniqueViewsPerWeek:       uniqueViewsPerWeek,
		DailyViewsAndImpressions: dailyViewsAndImpressions,
		ViewsByTrafficSource:     viewsByTrafficSource,
		ViewsByViewerSex:         viewsByViewerSex,
		ViewsByAgeRange:          viewsByAgeRange,
		ViewsByDevice:            viewsByDevice,
		LectureAnalytics:         lectureAnalytics,
		SearchQueries:            searchQueries,
		SearchQueriesRecent:      searchQueriesRecent,
	}, nil
}

func (s *AnalyticsService) GetTopSearchQueriesByPrefix(input GetTopSearchQueriesByPrefixInput) ([]analytics.CourseSearchQueriesRecent, error) {
	limit := input.Limit
	if limit <= 0 {
		limit = 10
	}
	return s.Repo.Analytics.FindTopSearchQueriesByPrefix(input.Prefix, limit)
}
