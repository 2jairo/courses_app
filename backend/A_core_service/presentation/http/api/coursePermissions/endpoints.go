package coursepermissions

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	coursepermissions "github.com/2jairo/courses_app/backend/A_core_service/application/services/coursePermissions"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type CoursePermissionsEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *CoursePermissionsEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())

	r.Post("/:courseId", self.SetUserPermissions)      // Admin
	r.Get("/:courseId", self.GetCourseIntegrants)      // Read
	r.Delete("/:courseId", self.DeleteUserPermissions) // Admin
}

func (self *CoursePermissionsEndpoints) SetUserPermissions(ctx *fiber.Ctx) error {
	c := &SetUserPermissionsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	currentUserPermissions, err := self.Services.CoursePermissions.GetUserPermissions(
		coursepermissions.HasRoleInput{
			CourseId:      entitycommon.Id(c.Params.CourseId),
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleAdmin,
		},
	)
	if err != nil {
		return global.Err(err)
	}

	if err := self.Services.CoursePermissions.SetUserPermissions(
		entitycommon.Id(c.Params.CourseId),
		c.Body.Username,
		c.Body.Role,
		currentUserPermissions,
	); err != nil {
		return global.Err(err)
	}

	ctx.Status(fiber.StatusOK)
	return nil
}

func (self *CoursePermissionsEndpoints) DeleteUserPermissions(ctx *fiber.Ctx) error {
	c := &DeleteUserPermissionsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	currentUserPermissions, err := self.Services.CoursePermissions.GetUserPermissions(
		coursepermissions.HasRoleInput{
			CourseId:      entitycommon.Id(c.Params.CourseId),
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleAdmin,
		},
	)
	if err != nil {
		return global.Err(err)
	}

	if err := self.Services.CoursePermissions.DeleteUserPermissions(
		entitycommon.Id(c.Params.CourseId),
		c.Query.Username,
		currentUserPermissions,
	); err != nil {
		return global.Err(err)
	}

	ctx.Status(fiber.StatusOK)
	return nil
}

func (self *CoursePermissionsEndpoints) GetCourseIntegrants(ctx *fiber.Ctx) error {
	c := &GetCourseIntegrantsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRole(
		coursepermissions.HasRoleInput{
			CourseId:      entitycommon.Id(c.CourseId),
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleRead,
		},
	); err != nil {
		return global.Err(err)
	}

	permissions, err := self.Services.CoursePermissions.GetCourseIntegrants(
		entitycommon.Id(c.CourseId),
	)
	if err != nil {
		return global.Err(err)
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(permissions))
}
