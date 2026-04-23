package courses

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type CreateCourseRequest struct {
	Body struct {
		Title               string                            `json:"title" validate:"required,min=3,max=100"`
		Description         string                            `json:"description" validate:"required,max=1000"`
		Visibility          *entity.CourseVisibility          `json:"visibility" validate:"omitempty,enum"`
		LectureAccesibility *entity.CourseLectureAccesibility `json:"lectureAccesibility" validate:"omitempty,enum"`
		Language            entity.CourseLanguage             `json:"language" validate:"required,enum"`
		Price               int32                             `json:"price" validate:"min=0"`
		DiscountPercent     int32                             `json:"discountPercent" validate:"min=0,max=100"`
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
	Tags                []UpdateCourseTagRequest          `json:"tags" validate:"omitempty,max=10,dive"`
}

type UpdateCourseTagRequest struct {
	Name string `json:"name" validate:"required,min=2,max=30"`
}

func (self *UpdateCourseRequestBody) HasAtLeastOneField() bool {
	return self.Title != nil ||
		self.Description != nil ||
		self.PosterFileId != nil ||
		self.Visibility != nil ||
		self.LectureAccesibility != nil ||
		self.Language != nil ||
		self.Price != nil ||
		self.DiscountPercent != nil ||
		self.Tags != nil
}

type DeleteCourseRequest struct {
	CourseId int64
}

type GetCourseDetailsRequest struct {
	CourseId int64
}

func (self *CreateCourseRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx, course *entity.Course) error {
	if err := utils.DefaultBind(&self.Body, ctx.BodyParser); err != nil {
		return global.Err(err)
	}

	course.Title = self.Body.Title
	course.Description = self.Body.Description
	course.Language = self.Body.Language
	course.Price = self.Body.Price
	course.DiscountPercent = self.Body.DiscountPercent

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

func (self *UpdateCourseRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return global.Err(err)
	}
	if err := u.DefaultBind(&self.Body, ctx.BodyParser); err != nil {
		return global.Err(err)
	}
	self.Body.Tags = utils.RemoveDuplicatesWithCb(self.Body.Tags, func(item UpdateCourseTagRequest) string {
		return item.Name
	})

	return nil
}

func (self *DeleteCourseRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	return utils.DefaultBind(self, ctx.ParamsParser)
}

func (self *GetCourseDetailsRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	return utils.DefaultBind(self, ctx.ParamsParser)
}
