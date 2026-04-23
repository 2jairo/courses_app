package lectureassets

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type SetFilesToLectureRequest struct {
	Path struct {
		LectureId int64
	}
	Body struct {
		FileIds []int64 `json:"fileIds" validate:"required"`
	}
}

type GetLectureFilesRequest struct {
	Path struct {
		LectureId int64
	}
}

func (self *SetFilesToLectureRequest) bind(utilsParam *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := utilsParam.DefaultBind(&self.Path, ctx.ParamsParser); err != nil {
		return global.Err(err)
	}
	if err := utilsParam.DefaultBind(&self.Body, ctx.BodyParser); err != nil {
		return global.Err(err)
	}
	if len(self.Body.FileIds) > 0 {
		self.Body.FileIds = utils.RemoveDuplicates(self.Body.FileIds)
	}
	return nil
}

func (self *GetLectureFilesRequest) bind(utilsParam *utils.AppUtils, ctx *fiber.Ctx) error {
	return utilsParam.DefaultBind(&self.Path, ctx.ParamsParser)
}
