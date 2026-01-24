package coursepermissions

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

type SetUserPermissionsRequest struct {
	Body struct {
		Username string                       `json:"username" validte:"required"`
		Role     entity.CoursePermissionsRole `json:"role" vlaidate:"required,enum"`
	}
	Params struct {
		CourseId int64 `json:"courseId" validte:"required"`
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

func (self *SetUserPermissionsRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	if err := state.DefaultBind(&self.Body, ctx.BodyParser); err != nil {
		return err
	}
	return state.DefaultBind(&self.Params, ctx.ParamsParser)
}

func (self *GetCourseIntegrantsRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(self, ctx.ParamsParser)
}

func (self *DeleteUserPermissionsRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	if err := state.DefaultBind(&self.Query, ctx.QueryParser); err != nil {
		return err
	}
	return state.DefaultBind(&self.Params, ctx.ParamsParser)
}
