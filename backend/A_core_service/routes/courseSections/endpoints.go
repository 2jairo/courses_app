package coursesections

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

type CourseSectionsEndpoints struct {
	State *state.AppState
}

func (self *CourseSectionsEndpoints) RegisterRoutes(r fiber.Router) {
	r.Post("/create", self.State.AuthMiddleware.ClientAuth(), self.CreateCourseSection)
}

func (self *CourseSectionsEndpoints) CreateCourseSection(ctx *fiber.Ctx) error {
	courseSection := &entity.CourseSection{}
	c := &CreateCourseSectionRequest{}
	if err := c.bind(self.State, ctx, courseSection); err != nil {
		return err
	}

	if err := self.State.CourseSectionRepository.Create(courseSection); err != nil {
		return err
	}
	return ctx.Status(fiber.StatusCreated).JSON(c.getResponse(courseSection))
}
