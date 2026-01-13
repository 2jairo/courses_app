package courses

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

type CreateCourseRequest struct {
	Title       string                   `json:"title" validate:"required,min=3,max=100"`
	Description string                   `json:"description" validate:"required,max=1000"`
	Poster      *string                  `json:"poster"`
	Visibility  *entity.CourseVisibility `json:"visibility" validate:"enum"`
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

type CourseResponse struct {
	UpdatedAt       time.Time               `json:"updatedAt"`
	Visibility      entity.CourseVisibility `json:"visibility"`
	Slug            string                  `json:"slug"`
	Title           string                  `json:"title"`
	Description     string                  `json:"description"`
	Poster          *string                 `json:"poster"`
	LecturesAmmount int32                   `json:"lecturesAmmount"`
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

func createOrUpdateCourseResponse(course *entity.Course) *CourseResponse {
	return &CourseResponse{
		UpdatedAt:       course.UpdatedAt,
		Visibility:      course.Visibility,
		Slug:            course.Slug.Slug,
		Title:           course.Title,
		Description:     course.Description,
		Poster:          course.Poster,
		LecturesAmmount: course.LecturesAmount,
	}
}

func (self *CreateCourseRequest) getResponse(course *entity.Course) *CourseResponse {
	return createOrUpdateCourseResponse(course)
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

func (self *UpdateCourseRequest) getResponse(course *entity.Course) *CourseResponse {
	return createOrUpdateCourseResponse(course)
}

func (self *DeleteCourseRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(self, ctx.ParamsParser)
}
