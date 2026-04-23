package analytics

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type GetCourseAnalyticsRequest struct {
	Params struct {
		CourseId int64 `params:"courseId"`
	}
}

func (self *GetCourseAnalyticsRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(&self.Params, ctx.ParamsParser)
}
