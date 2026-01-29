package courses

import (
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type FindCoursesRequest struct {
	Query struct {
		utils.Pagination
		QueryByTitle string `query:"q" json:"q"`
	}
}

type WatchCourseRequest struct {
	Params struct {
		CourseSlug string
	}
}

func (self *FindCoursesRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(&self.Query, ctx.QueryParser)
}
func (self *WatchCourseRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(&self.Params, ctx.ParamsParser)
}
