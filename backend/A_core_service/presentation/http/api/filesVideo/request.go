package filesvideo

import (
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

type GetVideoDetailsRequest struct {
	Path struct {
		FileId int64
	}
}

func (self *GetVideoDetailsRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(&self.Path, ctx.ParamsParser)
}
