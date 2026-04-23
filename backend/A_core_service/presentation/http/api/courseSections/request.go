package coursesections

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type CreateCourseSectionRequest struct {
	Body struct {
		CourseId int64 `json:"courseId" validate:"required"`
		// CourseUpdatedAt time.Time `json:"courseUpdatedAt" validate:"required"`
		Title string `json:"title" validate:"required,min=3,max=100"`
	}
}

type DeleteCourseSectionRequest struct {
	Params struct {
		SectionId int64
	}
}

type UpdateCourseSectionRequest struct {
	Body   UpdateCourseSectionRequestBody
	Params struct {
		SectionId int64
	}
}
type UpdateCourseSectionRequestBody struct {
	Title *string `json:"title" validate:"required,min=3,max=100"`
}

type UpdateCourseSectionPositionRequest struct {
	Body struct {
		Position int   `json:"position" validate:"required,min=1"`
		CourseId int64 `json:"courseId" validate:"required"`
	}
	Params struct {
		SectionId int64
	}
}

func (self *UpdateCourseSectionRequestBody) HasAtLeastOneField() bool {
	return self.Title != nil
}

func (self *CreateCourseSectionRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(&self.Body, ctx.BodyParser)
}

func (self *DeleteCourseSectionRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(&self.Params, ctx.ParamsParser)
}

func (self *UpdateCourseSectionRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx, section *entity.CourseSection) error {
	if err := u.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return global.Err(err)
	}
	if err := u.DefaultBind(&self.Body, ctx.BodyParser); err != nil {
		return global.Err(err)
	}

	if self.Body.Title != nil {
		section.Title = *self.Body.Title
	}

	return nil
}

func (self *UpdateCourseSectionPositionRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return global.Err(err)
	}
	return u.DefaultBind(&self.Body, ctx.BodyParser)
}
