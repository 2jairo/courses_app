package courses

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CreateCourseRequest struct {
	Body struct {
		Title       string                   `json:"title" validate:"required,min=3,max=100"`
		Description string                   `json:"description" validate:"required,max=1000"`
		Poster      *string                  `json:"poster"`
		Visibility  *entity.CourseVisibility `json:"visibility" validate:"enum"`
	}
}

type GetDashboardCourses struct {
	Query struct {
		utils.Pagination
		QueryByTitle string `query:"q" json:"q"`
	}
}

type UpdateCourseRequest struct {
	Body   UpdateCourseRequestBody
	Params struct {
		CourseId int64
	}
}
type UpdateCourseRequestBody struct {
	Title       *string                  `json:"title" validate:"omitempty,min=3,max=100"`
	Description *string                  `json:"description" validate:"omitempty,max=1000"`
	Poster      *string                  `json:"poster"`
	Visibility  *entity.CourseVisibility `json:"visibility" validate:"omitempty,enum"`
}

func (self *UpdateCourseRequestBody) HasAtLeastOneField() bool {
	return self.Title != nil || self.Description != nil || self.Poster != nil || self.Visibility != nil
}

type DeleteCourseRequest struct {
	CourseId int64
}

type GetCourseDetailsRequest struct {
	CourseId int64
}

func (self *CreateCourseRequest) bind(state *state.AppState, ctx *fiber.Ctx, course *entity.Course) error {
	if err := state.DefaultBind(&self.Body, ctx.BodyParser); err != nil {
		return err
	}

	course.Title = self.Body.Title
	course.Description = self.Body.Description
	if self.Body.Poster != nil {
		poster := entitycommon.Path(*self.Body.Poster)
		course.Poster = &poster
	}

	if self.Body.Visibility != nil {
		course.Visibility = *self.Body.Visibility
	}

	return nil
}

func (self *GetDashboardCourses) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(&self.Query, ctx.QueryParser)
}

func (self *UpdateCourseRequest) bind(state *state.AppState, ctx *fiber.Ctx, course *entity.Course) error {
	if err := state.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return err
	}
	if err := state.DefaultBind(&self.Body, ctx.BodyParser); err != nil {
		return err
	}

	if self.Body.Title != nil {
		course.Title = *self.Body.Title
	}
	if self.Body.Description != nil {
		course.Description = *self.Body.Description
	}
	if self.Body.Poster != nil {
		poster := entitycommon.Path(*self.Body.Poster)
		course.Poster = &poster
	}
	if self.Body.Visibility != nil {
		course.Visibility = *self.Body.Visibility
	}

	return nil
}

func (self *DeleteCourseRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(self, ctx.ParamsParser)
}

func (self *GetCourseDetailsRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(self, ctx.ParamsParser)
}
