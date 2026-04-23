package coursesections

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	coursepermissions "github.com/2jairo/courses_app/backend/A_core_service/application/services/coursePermissions"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type CourseSectionsEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *CourseSectionsEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())
	r.Post("/create", self.CreateCourseSection)                     // Write
	r.Put("/:sectionId", self.UpdateCourseSection)                  // Write
	r.Put("/:sectionId/position", self.UpdateCourseSectionPosition) // Write
	r.Delete("/:sectionId", self.DeleteCourseSection)               // Write
}

func (self *CourseSectionsEndpoints) CreateCourseSection(ctx *fiber.Ctx) error {
	c := &CreateCourseSectionRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRole(
		coursepermissions.HasRoleInput{
			CourseId:      entitycommon.Id(c.Body.CourseId),
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleWrite,
		},
	); err != nil {
		return global.Err(err)
	}

	courseSection, err := self.Services.CourseSection.CreateCourseSection(
		entitycommon.Id(c.Body.CourseId),
		c.Body.Title,
	)
	if err != nil {
		return global.Err(err)
	}

	return ctx.Status(fiber.StatusCreated).JSON(c.getResponse(courseSection))
}

func (self *CourseSectionsEndpoints) UpdateCourseSection(ctx *fiber.Ctx) error {
	c := &UpdateCourseSectionRequest{}
	section := &entity.CourseSection{}

	if err := c.bind(self.Utils, ctx, section); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRoleFromCourseSection(
		coursepermissions.HasRoleFromCourseSectionInput{
			CourseSectionId: entitycommon.Id(c.Params.SectionId),
			UserJwtClaims:   userJwtClaims,
			MinRole:         entity.CoursePermissionsRoleWrite,
		},
	); err != nil {
		return global.Err(err)
	}

	updated, err := self.Services.CourseSection.UpdateCourseSection(
		entitycommon.Id(c.Params.SectionId),
		section,
	)
	if err != nil {
		return global.Err(err)
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(updated))
}

func (self *CourseSectionsEndpoints) DeleteCourseSection(ctx *fiber.Ctx) error {
	c := &DeleteCourseSectionRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRoleFromCourseSection(
		coursepermissions.HasRoleFromCourseSectionInput{
			CourseSectionId: entitycommon.Id(c.Params.SectionId),
			UserJwtClaims:   userJwtClaims,
			MinRole:         entity.CoursePermissionsRoleWrite,
		},
	); err != nil {
		return global.Err(err)
	}

	err := self.Services.CourseSection.DeleteCourseSection(
		entitycommon.Id(c.Params.SectionId),
	)
	if err != nil {
		return global.Err(err)
	}

	ctx.Status(fiber.StatusOK)
	return nil
}

func (self *CourseSectionsEndpoints) UpdateCourseSectionPosition(ctx *fiber.Ctx) error {
	c := &UpdateCourseSectionPositionRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRole(
		coursepermissions.HasRoleInput{
			CourseId:      entitycommon.Id(c.Body.CourseId),
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleWrite,
		},
	); err != nil {
		return global.Err(err)
	}

	err := self.Services.CourseSection.UpdateCourseSectionPosition(
		entitycommon.Id(c.Params.SectionId),
		entitycommon.Id(c.Body.CourseId),
		c.Body.Position,
	)
	if err != nil {
		return global.Err(err)
	}

	ctx.Status(fiber.StatusOK)
	return nil
}
