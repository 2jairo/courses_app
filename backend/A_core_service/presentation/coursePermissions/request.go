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
		CourseSlug string `json:"courseSlug" validte:"required"`
	}
}

type GetCourseIntegrantsRequest struct {
	CourseSlug string
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
