package courses

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/middleware"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CoursesEndpoints struct {
	State *state.AppState
}

func (self *CoursesEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.State.AuthMiddleware.ClientAuth())
	canRead := self.State.CourseRoleMiddleware.HasRole(entity.CoursePermissionsRoleRead)
	canWrite := self.State.CourseRoleMiddleware.HasRole(entity.CoursePermissionsRoleWrite)
	isOwner := self.State.CourseRoleMiddleware.HasRole(entity.CoursePermissionsRoleOwner)

	r.Post("/create", self.CreateCourse)
	r.Get("/", self.GetCourses)
	r.Get("/:courseId", canRead, self.GetCourseDetails)
	r.Put("/:courseId", canWrite, self.UpdateCourse)
	r.Delete("/:courseId", isOwner, self.DeleteCourse)
}

func (self *CoursesEndpoints) CreateCourse(ctx *fiber.Ctx) error {
	course := &entity.Course{}
	c := &CreateCourseRequest{}
	if err := c.bind(self.State, ctx, course); err != nil {
		return err
	}

	if err := self.State.CourseRepository.Create(course); err != nil {
		return err
	}

	userJwtClaims := ctx.Locals(middleware.LocalsMwJwtClaims).(*utils.ClientJwtClaims)
	permissions := &entity.CoursePermissions{
		UserID:   userJwtClaims.UserId,
		CourseID: course.ID,
		Role:     entity.CoursePermissionsRoleOwner,
	}
	if err := self.State.CoursePermissionsRepository.Create(permissions); err != nil {
		return err
	}

	return ctx.Status(fiber.StatusCreated).JSON(c.getResponse(course, permissions))
}

func (self *CoursesEndpoints) GetCourses(ctx *fiber.Ctx) error {
	c := &GetDashboardCourses{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	userJwtClaims := ctx.Locals(middleware.LocalsMwJwtClaims).(*utils.ClientJwtClaims)
	preload := entity.CoursePermissionsPreloadOptions{
		Course: true,
	}
	withPermissions, err := self.State.CourseRoleMiddleware.FindCoursesWithPrefix(
		userJwtClaims.UserId,
		preload,
		&c.Query.Pagination,
		c.Query.QueryByTitle,
	)
	if err != nil {
		return err
	}

	ctx.Status(200).JSON(c.getResponse(withPermissions))
	return nil
}

func (self *CoursesEndpoints) GetCourseDetails(ctx *fiber.Ctx) error {
	c := &GetCourseDetailsRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	course := &entity.Course{Model: entitycommon.Model{ID: c.CourseId}}
	preload := entity.CoursePreloadOptions{
		Sections: true,
		CourseSectionPreloadOptions: entity.CourseSectionPreloadOptions{
			Lectures: true,
		},
	}
	if err := self.State.CourseRepository.FindOne(course, preload); err != nil {
		return err
	}

	permissions := ctx.Locals(middleware.LocalsMwCoursePermissions).(*entity.CoursePermissions)
	return ctx.Status(200).JSON(c.getResponse(course, permissions))
}

func (self *CoursesEndpoints) UpdateCourse(ctx *fiber.Ctx) error {
	course := &entity.Course{}
	c := &UpdateCourseRequest{}
	if err := c.bind(self.State, ctx, course); err != nil {
		return err
	}

	updateBy := &entity.Course{Model: entitycommon.Model{ID: c.Params.CourseId}}
	updated, err := self.State.CourseRepository.Update(updateBy, course)
	if err != nil {
		return err
	}

	permissions := ctx.Locals(middleware.LocalsMwCoursePermissions).(*entity.CoursePermissions)
	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(updated, permissions))
}

func (self *CoursesEndpoints) DeleteCourse(ctx *fiber.Ctx) error {
	c := &DeleteCourseRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	course := &entity.Course{Model: entitycommon.Model{ID: c.CourseId}}
	preload := entity.CoursePreloadOptions{
		Sections: true,
		CourseSectionPreloadOptions: entity.CourseSectionPreloadOptions{
			Lectures: true,
			LecturePreloadOptions: entity.LecturePreloadOptions{
				Assets: true,
			},
		},
		Permissions: true,
	}
	if err := self.State.CourseRepository.FindOne(course, preload); err != nil {
		return err
	}

	if err := self.State.CourseRepository.Delete(course); err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}
