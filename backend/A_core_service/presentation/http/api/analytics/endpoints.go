package analytics

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	analyticsservice "github.com/2jairo/courses_app/backend/A_core_service/application/services/analytics"
	coursepermissions "github.com/2jairo/courses_app/backend/A_core_service/application/services/coursePermissions"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
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
	r.Use(self.Services.Middleware.ClientAuth())

	r.Get("/:courseId", self.GetCourseAnalytics)
}

func (self *AnalyticsEndpoints) GetCourseAnalytics(ctx *fiber.Ctx) error {
	c := &GetCourseAnalyticsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRole(
		coursepermissions.HasRoleInput{
			CourseId:      entitycommon.Id(c.Params.CourseId),
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleWrite,
		},
	); err != nil {
		return global.Err(err)
	}

	analytics, err := self.Services.Analytics.GetCourseAnalytics(
		analyticsservice.GetCourseAnalyticsInput{
			CourseID: entitycommon.Id(c.Params.CourseId),
		},
	)
	if err != nil {
		return global.Err(err)
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(analytics))
}
