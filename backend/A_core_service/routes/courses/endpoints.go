package courses

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

type CoursesEndpoints struct {
	State *state.AppState
}

func (self *CoursesEndpoints) RegisterRoutes(r fiber.Router) {
	r.Post("/create", self.State.AuthMiddleware.ClientAuth(), self.CreateCourse)
	r.Put("/:slug", self.State.AuthMiddleware.ClientAuth(), self.UpdateCourse)
	r.Delete("/:slug", self.State.AuthMiddleware.ClientAuth(), self.DeleteCourse)
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
	return ctx.Status(fiber.StatusCreated).JSON(c.getResponse(course))
}

func (self *CoursesEndpoints) UpdateCourse(ctx *fiber.Ctx) error {
	courseSlug := ctx.Params("slug")
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

	updated, err := self.State.CourseRepository.Update(&entity.Course{Slug: courseSlug}, course)
	if err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(updated))
}

func (self *CoursesEndpoints) DeleteCourse(ctx *fiber.Ctx) error {
	courseSlug := ctx.Params("slug")
	if courseSlug == "" {
		return &localerror.LocalError{
			Err:    localerror.ErrKindPathRejection,
			Status: fiber.StatusBadRequest,
			Msg:    "course slug is required",
		}
	}

	if err := self.State.CourseRepository.Delete(&entity.Course{
		Slug: courseSlug,
	}); err != nil {
		return err
	}

	return ctx.SendStatus(fiber.StatusOK)
}
