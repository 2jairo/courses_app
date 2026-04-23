package analytics

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type TrackCourseViewRequest struct {
	Params struct {
		CourseId int64 `params:"courseId"`
	}
	Body struct {
		ViewSource *analytics.CourseViewsSource `json:"viewSource" validate:"omitempty,enum"`
	}
}

func (self *TrackCourseViewRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return global.Err(err)
	}
	return u.DefaultBind(&self.Body, ctx.BodyParser)
}

type TrackLectureViewRequest struct {
	Params struct {
		LectureId int64 `params:"lectureId"`
	}
	Body struct {
		ViewSeconds float64 `json:"viewSeconds" validate:"required"`
	}
}

func (self *TrackLectureViewRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return global.Err(err)
	}
	return u.DefaultBind(&self.Body, ctx.BodyParser)
}
