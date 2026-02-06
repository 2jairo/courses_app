package lectures

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type GetLectureRequest struct {
	Params struct {
		LectureSlug string
	}
}

func (self *GetLectureRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	return utils.DefaultBind(&self.Params, ctx.ParamsParser)
}
