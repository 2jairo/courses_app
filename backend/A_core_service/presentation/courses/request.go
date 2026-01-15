package courses

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CreateCourseRequest struct {
	Title       string                   `json:"title" validate:"required,min=3,max=100"`
	Description string                   `json:"description" validate:"required,max=1000"`
	Poster      *string                  `json:"poster"`
	Visibility  *entity.CourseVisibility `json:"visibility" validate:"enum"`
}

type GetDashboardCourses struct {
	Query struct {
		utils.Pagination
	}
}

type UpdateCourseRequest struct {
	Title       *string                  `json:"title" validate:"omitempty,min=3,max=100"`
	Description *string                  `json:"description" validate:"omitempty,max=1000"`
	Poster      *string                  `json:"poster"`
	Visibility  *entity.CourseVisibility `json:"visibility" validate:"omitempty,enum"`
}

func (self *UpdateCourseRequest) HasAtLeastOneField() bool {
	return self.Title != nil || self.Description != nil || self.Poster != nil || self.Visibility != nil
}

type DeleteCourseRequest struct {
	CourseSlug string
}

func (self *CreateCourseRequest) bind(state *state.AppState, ctx *fiber.Ctx, course *entity.Course) error {
	if err := state.DefaultBind(self, ctx.BodyParser); err != nil {
		return err
	}

	course.Title = self.Title
	course.Description = self.Description
	course.Poster = self.Poster

	if self.Visibility != nil {
		course.Visibility = *self.Visibility
	}

	return nil
}

func (self *GetDashboardCourses) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(&self.Query, ctx.QueryParser)
}

func (self *UpdateCourseRequest) bind(state *state.AppState, ctx *fiber.Ctx, course *entity.Course) error {
	if err := state.DefaultBind(self, ctx.BodyParser); err != nil {
		return err
	}

	if self.Title != nil {
		course.Title = *self.Title
	}
	if self.Description != nil {
		course.Description = *self.Description
	}
	if self.Poster != nil {
		course.Poster = self.Poster
	}
	if self.Visibility != nil {
		course.Visibility = *self.Visibility
	}

	return nil
}

func (self *DeleteCourseRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(self, ctx.ParamsParser)
}
