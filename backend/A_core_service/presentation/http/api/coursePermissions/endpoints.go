package coursepermissions

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CoursePermissionsEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *CoursePermissionsEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())
	isAdmin := self.Services.Middleware.HasRole(entity.CoursePermissionsRoleAdmin)
	canRead := self.Services.Middleware.HasRole(entity.CoursePermissionsRoleRead)

	r.Post("/:courseId", isAdmin, self.SetUserPermissions)
	r.Get("/:courseId", canRead, self.GetCourseIntegrants)
	r.Delete("/:courseId", isAdmin, self.DeleteUserPermissions)
}

func (self *CoursePermissionsEndpoints) SetUserPermissions(ctx *fiber.Ctx) error {
	c := &SetUserPermissionsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	err := self.Services.CoursePermissions.SetUserPermissions(
		entitycommon.Id(c.Params.CourseId),
		c.Body.Username,
		c.Body.Role,
		entitycommon.Id(userJwtClaims.UserId),
	)
	if err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}

func (self *CoursePermissionsEndpoints) DeleteUserPermissions(ctx *fiber.Ctx) error {
	c := &DeleteUserPermissionsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	err := self.Services.CoursePermissions.DeleteUserPermissions(
		entitycommon.Id(c.Params.CourseId),
		c.Query.Username,
		entitycommon.Id(userJwtClaims.UserId),
	)
	if err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}

func (self *CoursePermissionsEndpoints) GetCourseIntegrants(ctx *fiber.Ctx) error {
	c := &GetCourseIntegrantsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	permissions, err := self.Services.CoursePermissions.GetCourseIntegrants(
		entitycommon.Id(c.CourseId),
	)
	if err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(permissions))
}
