package coursepermissions

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type SetUserPermissionsRequest struct {
	Body struct {
		Username string                       `json:"username" validate:"required"`
		Role     entity.CoursePermissionsRole `json:"role" validate:"required,enum"`
	}
	Params struct {
		CourseId int64 `json:"courseId" validate:"required"`
	}
}

type GetCourseIntegrantsRequest struct {
	CourseId int64
}

type DeleteUserPermissionsRequest struct {
	Query struct {
		Username string `json:"username" validate:"required"`
	}
	Params struct {
		CourseId int64 `json:"courseId" validate:"required"`
	}
}

func (self *SetUserPermissionsRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Body, ctx.BodyParser); err != nil {
		return err
	}
	return u.DefaultBind(&self.Params, ctx.ParamsParser)
}

func (self *GetCourseIntegrantsRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(self, ctx.ParamsParser)
}

func (self *DeleteUserPermissionsRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Query, ctx.QueryParser); err != nil {
		return err
	}
	return u.DefaultBind(&self.Params, ctx.ParamsParser)
}
