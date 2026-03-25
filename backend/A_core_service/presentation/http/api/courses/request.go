package courses

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CreateCourseRequest struct {
	Body struct {
		Title               string                            `json:"title" validate:"required,min=3,max=100"`
		Description         string                            `json:"description" validate:"required,max=1000"`
		Poster              *string                           `json:"poster"`
		Visibility          *entity.CourseVisibility          `json:"visibility" validate:"enum"`
		LectureAccesibility *entity.CourseLectureAccesibility `json:"lectureAccesibility" validate:"enum"`
		Language            entity.CourseLanguage             `json:"language" validate:"required,enum"`
		Price               int32                             `json:"price" validate:"required,min=0"`
		DiscountPercent     int32                             `json:"discountPercent" validate:"required,min=0,max=100"`
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
	Title               *string                           `json:"title" validate:"omitempty,min=3,max=100"`
	Description         *string                           `json:"description" validate:"omitempty,max=1000"`
	PosterFileId        *int64                            `json:"posterFileId"`
	LectureAccesibility *entity.CourseLectureAccesibility `json:"lectureAccesibility" validate:"omitempty,enum"`
	Visibility          *entity.CourseVisibility          `json:"visibility" validate:"omitempty,enum"`
	Language            *entity.CourseLanguage            `json:"language" validate:"omitempty,enum"`
	Price               *int32                            `json:"price" validate:"omitempty,min=0"`
	DiscountPercent     *int32                            `json:"discountPercent" validate:"omitempty,min=0,max=100"`
}

func (self *UpdateCourseRequestBody) HasAtLeastOneField() bool {
	return self.Title != nil ||
		self.Description != nil ||
		self.PosterFileId != nil ||
		self.Visibility != nil ||
		self.LectureAccesibility != nil ||
		self.Language != nil ||
		self.Price != nil ||
		self.DiscountPercent != nil
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
	course.Price = self.Body.Price
	course.DiscountPercent = self.Body.DiscountPercent

	if self.Body.Poster != nil {
		poster := entitycommon.Path(*self.Body.Poster)
		course.Poster = &poster
	}
	if self.Body.Visibility != nil {
		course.Visibility = *self.Body.Visibility
	}
	if self.Body.LectureAccesibility != nil {
		course.LectureAccesibility = *self.Body.LectureAccesibility
	}

	return nil
}

func (self *GetDashboardCourses) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	return utils.DefaultBind(&self.Query, ctx.QueryParser)
}

func (self *UpdateCourseRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := utils.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return err
	}
	if err := utils.DefaultBind(&self.Body, ctx.BodyParser); err != nil {
		return err
	}

	return nil
}

func (self *DeleteCourseRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	return utils.DefaultBind(self, ctx.ParamsParser)
}

func (self *GetCourseDetailsRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	return utils.DefaultBind(self, ctx.ParamsParser)
}
