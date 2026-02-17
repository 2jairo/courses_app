package analytics

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/gofiber/fiber/v2"
)

type AnalyticsService struct {
	Repo *infrastructure.AppRepositories
}

func (s *AnalyticsService) TrackCourseImpression(input TrackCourseViewInput) error {
	// Verify course exists
	course := &entity.Course{Model: entitycommon.Model{ID: input.CourseId}}
	if err := s.Repo.Course.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
		return &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
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

	return s.Repo.Analytics.CreateView(view)
}
