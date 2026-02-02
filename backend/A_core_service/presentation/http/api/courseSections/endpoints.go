package coursesections

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CourseSectionsEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *CourseSectionsEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())
	canWrite := self.Services.Middleware.HasRole(entity.CoursePermissionsRoleWrite)

	r.Post("/create", canWrite, self.CreateCourseSection)
	r.Put("/:sectionId", canWrite, self.UpdateCourseSection)
	r.Put("/:sectionId/position", canWrite, self.UpdateCourseSectionPosition)
	r.Delete("/:sectionId", canWrite, self.DeleteCourseSection)
}

func (self *CourseSectionsEndpoints) CreateCourseSection(ctx *fiber.Ctx) error {
	c := &CreateCourseSectionRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	courseSection, err := self.Services.CourseSection.CreateCourseSection(
		entitycommon.Id(c.Body.CourseId),
		c.Body.Title,
	)
	if err != nil {
		return err
	}

	return ctx.Status(fiber.StatusCreated).JSON(c.getResponse(courseSection))
}

func (self *CourseSectionsEndpoints) UpdateCourseSection(ctx *fiber.Ctx) error {
	c := &UpdateCourseSectionRequest{}
	section := &entity.CourseSection{}

	if err := c.bind(self.Utils, ctx, section); err != nil {
		return err
	}

	updated, err := self.Services.CourseSection.UpdateCourseSection(
		entitycommon.Id(c.Params.SectionId),
		section,
	)
	if err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(updated))
}

func (self *CourseSectionsEndpoints) DeleteCourseSection(ctx *fiber.Ctx) error {
	c := &DeleteCourseSectionRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	err := self.Services.CourseSection.DeleteCourseSection(
		entitycommon.Id(c.Params.SectionId),
	)
	if err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}

func (self *CourseSectionsEndpoints) UpdateCourseSectionPosition(ctx *fiber.Ctx) error {
	c := &UpdateCourseSectionPositionRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	err := self.Services.CourseSection.UpdateCourseSectionPosition(
		entitycommon.Id(c.Params.SectionId),
		entitycommon.Id(c.Body.CourseId),
		c.Body.Position,
	)
	if err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}
