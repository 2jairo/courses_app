package filesvideo

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type GetVideoDetailsRequest struct {
	Path struct {
		FileId int64
	}
}

func (self *GetVideoDetailsRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	return utils.DefaultBind(&self.Path, ctx.ParamsParser)
}
