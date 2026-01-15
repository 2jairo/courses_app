package courses

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/middleware"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CoursesEndpoints struct {
	State *state.AppState
}

func (self *CoursesEndpoints) RegisterRoutes(r fiber.Router) {
	r.Post("/create", self.State.AuthMiddleware.ClientAuth(), self.CreateCourse)
	r.Get("/dashboard", self.State.AuthMiddleware.ClientAuth(), self.GetDashboardCourses)
	r.Put("/:courseSlug", self.State.AuthMiddleware.ClientAuth(), self.UpdateCourse)
	r.Delete("/:courseSlug", self.State.AuthMiddleware.ClientAuth(), self.DeleteCourse)
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

	return ctx.Status(fiber.StatusCreated).JSON(c.getResponse(course))
}

func (self *CoursesEndpoints) GetDashboardCourses(ctx *fiber.Ctx) error {
	c := &GetDashboardCourses{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	// self.State.CourseRepository.

	return nil
}

func (self *CoursesEndpoints) UpdateCourse(ctx *fiber.Ctx) error {
	courseSlug := ctx.Params("courseSlug")
	if courseSlug == "" {
		return &localerror.LocalError{
			Err:    localerror.ErrKindPathRejection,
			Status: fiber.StatusBadRequest,
			Msg:    "course slug is required",
		}
	}

	course := &entity.Course{}
	c := &UpdateCourseRequest{}
	if err := c.bind(self.State, ctx, course); err != nil {
		return err
	}

	updateBy := &entity.Course{Slug: entity.Slug{Slug: courseSlug}}
	updated, err := self.State.CourseRepository.Update(updateBy, course)
	if err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(updated))
}

func (self *CoursesEndpoints) DeleteCourse(ctx *fiber.Ctx) error {
	c := &DeleteCourseRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	course := &entity.Course{Slug: entity.Slug{Slug: c.CourseSlug}}
	preload := entity.CoursePreloadOptions{
		Sections: true,
		CourseSectionPreloadOptions: entity.CourseSectionPreloadOptions{
			Lectures: true,
			LecturePreloadOptions: entity.LecturePreloadOptions{
				Assets: true,
			},
		},
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
