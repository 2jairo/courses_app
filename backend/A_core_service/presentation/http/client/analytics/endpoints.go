package analytics

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	analyticsService "github.com/2jairo/courses_app/backend/A_core_service/application/services/analytics"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/middlewares"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type AnalyticsEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *AnalyticsEndpoints) RegisterRoutes(r fiber.Router) {
	optionalAuth := self.Services.Middleware.ClientAuth(middlewares.ClientAuthParams{Optional: true})
	requiredAuth := self.Services.Middleware.ClientAuth()
	ua := self.Services.Middleware.GuessUADeviceType()
	geoLocate := self.Services.Middleware.GeoLocate()

	r.Post("/watch/course/:courseId", optionalAuth, ua, geoLocate, self.TrackCourseView)
	r.Post("/watch/lecture/:lectureId", requiredAuth, ua, self.TrackLectureView)
}

// https://v0.app/chat/course-analytics-page-rpcRenz0JDl

func (self *AnalyticsEndpoints) TrackCourseView(ctx *fiber.Ctx) error {
	c := &TrackCourseViewRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	deviceType := self.Services.Middleware.GetUADeviceType(ctx)
	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	// geoLocated := self.Services.Middleware.GetGeoLocated(ctx)

	var userId *entitycommon.Id = nil
	var userSex *entity.UserSex = nil
	var birthDate *time.Time = nil
	if userJwtClaims != nil {
		userId = (*entitycommon.Id)(&userJwtClaims.UserId)
		userSex = (*entity.UserSex)(&userJwtClaims.Analytics.Sex)
		birthDate = &userJwtClaims.Analytics.BirthDate
	}

	viewSource := analytics.CourseViewsSourceDirect
	if c.Body.ViewSource != nil {
		viewSource = *c.Body.ViewSource
	}

	if err := self.Services.Analytics.TrackCourseView(
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
		return global.Err(err)
	}

	return ctx.SendStatus(fiber.StatusOK)
}

func (self *AnalyticsEndpoints) TrackLectureView(ctx *fiber.Ctx) error {
	c := &TrackLectureViewRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}
	if c.Body.ViewSeconds <= 3 {
		return ctx.SendStatus(fiber.StatusOK)
	}

	deviceType := self.Services.Middleware.GetUADeviceType(ctx)
	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)

	if err := self.Services.Analytics.TrackLectureView(
		analyticsService.TrackLectureViewInput{
			LectureId:   entitycommon.Id(c.Params.LectureId),
			UserId:      entitycommon.Id(userJwtClaims.UserId),
			UserSex:     entity.UserSex(userJwtClaims.Analytics.Sex),
			DeviceType:  *deviceType,
			ViewSeconds: uint32(c.Body.ViewSeconds),
		},
	); err != nil {
		return global.Err(err)
	}

	return ctx.SendStatus(fiber.StatusOK)
}
