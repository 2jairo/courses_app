package courseanalytics

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	analyticsService "github.com/2jairo/courses_app/backend/A_core_service/application/services/analytics"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/middlewares"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CourseAnalyticsEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *CourseAnalyticsEndpoints) RegisterRoutes(r fiber.Router) {
	optionalAuth := self.Services.Middleware.ClientAuth(middlewares.ClientAuthParams{Optional: true})
	ua := self.Services.Middleware.GuessUADeviceType()

	r.Post("/watch/:courseId", optionalAuth, ua, self.TrackCourseView)
}

func (self *CourseAnalyticsEndpoints) TrackCourseView(ctx *fiber.Ctx) error {
	c := &TrackCourseViewRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	deviceType := self.Services.Middleware.GetUADeviceType(ctx)
	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)

	var userId *entitycommon.Id = nil
	var userSex *entity.UserSex = nil
	var birthDate *time.Time = nil
	if userJwtClaims != nil {
		userId = (*entitycommon.Id)(&userJwtClaims.UserId)
		userSex = (*entity.UserSex)(&userJwtClaims.Analytics.Sex)
		birthDate = &userJwtClaims.Analytics.BirthDate
	}

	viewSource := analytics.CourseViewsSourceDirect
	if c.Query.ViewSource != nil {
		viewSource = *c.Query.ViewSource
	}

	if err := self.Services.Analytics.TrackCourseImpression(
		analyticsService.TrackCourseViewInput{
			CourseId:   entitycommon.Id(c.Params.CourseId),
			UserId:     userId,
			UserSex:    userSex,
			DeviceType: *deviceType,
			ViewSource: viewSource,
			BirthDate:  birthDate,
			Seen:       true,
		},
	); err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}
