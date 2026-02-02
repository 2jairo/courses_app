package courses

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CreateCourseRequest struct {
	Body struct {
		Title       string                   `json:"title" validate:"required,min=3,max=100"`
		Description string                   `json:"description" validate:"required,max=1000"`
		Poster      *string                  `json:"poster"`
		Visibility  *entity.CourseVisibility `json:"visibility" validate:"enum"`
		Language    entity.CourseLanguage    `json:"language" validate:"required,enum"`
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
	Language    *entity.CourseLanguage   `json:"language" validate:"omitempty,enum"`
}

func (self *UpdateCourseRequestBody) HasAtLeastOneField() bool {
	return self.Title != nil || self.Description != nil || self.Poster != nil || self.Visibility != nil || self.Language != nil
}

type DeleteCourseRequest struct {
	CourseId int64
}

type GetCourseDetailsRequest struct {
	CourseId int64
}

func (self *CreateCourseRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx, course *entity.Course) error {
	if err := utils.DefaultBind(&self.Body, ctx.BodyParser); err != nil {
		return err
	}

	course.Title = self.Body.Title
	course.Description = self.Body.Description
	course.Language = self.Body.Language

	if self.Body.Poster != nil {
		poster := entitycommon.Path(*self.Body.Poster)
		course.Poster = &poster
	}
	if self.Body.Visibility != nil {
		course.Visibility = *self.Body.Visibility
	}

	return nil
}

func (self *GetDashboardCourses) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	return utils.DefaultBind(&self.Query, ctx.QueryParser)
}

func (self *UpdateCourseRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx, course *entity.Course) error {
	if err := utils.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return err
	}
	if err := utils.DefaultBind(&self.Body, ctx.BodyParser); err != nil {
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
	if self.Body.Language != nil {
		course.Language = *self.Body.Language
	}

	return nil
}

func (self *DeleteCourseRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	return utils.DefaultBind(self, ctx.ParamsParser)
}

func (self *GetCourseDetailsRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	return utils.DefaultBind(self, ctx.ParamsParser)
}
