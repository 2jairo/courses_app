package lectureassets

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
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

func removeDuplicates(nums []int64) []int64 {
	seen := make(map[int64]struct{}, len(nums))
	j := 0

	for _, n := range nums {
		if _, ok := seen[n]; ok {
			continue
		}
		seen[n] = struct{}{}
		nums[j] = n
		j++
	}

	return nums[:j]
}

func (self *SetFilesToLectureRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := utils.DefaultBind(&self.Path, ctx.ParamsParser); err != nil {
		return err
	}
	if err := utils.DefaultBind(&self.Body, ctx.BodyParser); err != nil {
		return err
	}
	if len(self.Body.FileIds) > 0 {
		self.Body.FileIds = removeDuplicates(self.Body.FileIds)
	}
	return nil
}

func (self *GetLectureFilesRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	return utils.DefaultBind(&self.Path, ctx.ParamsParser)
}
