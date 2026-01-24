package lectureassets

import (
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

type AddFilesToLectureRequest struct {
	Path struct {
		LectureId int64
	}
	Body struct {
		FileIds []int64 `json:"fileIds" validate:"required,min=1"`
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

func (self *AddFilesToLectureRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	if err := state.DefaultBind(&self.Path, ctx.ParamsParser); err != nil {
		return err
	}
	if err := state.DefaultBind(&self.Body, ctx.BodyParser); err != nil {
		return err
	}
	self.Body.FileIds = removeDuplicates(self.Body.FileIds)
	return nil
}

func (self *GetLectureFilesRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(&self.Path, ctx.ParamsParser)
}
