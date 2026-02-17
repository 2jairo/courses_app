package courseanalytics

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type TrackCourseViewRequest struct {
	Params struct {
		CourseId int64 `params:"courseId"`
	}
	Query struct {
		ViewSource *analytics.CourseViewsSource `json:"viewSource" validate:"omitempty,enum"`
	}
}

func (self *TrackCourseViewRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return err
	}
	return u.DefaultBind(&self.Query, ctx.QueryParser)
}
