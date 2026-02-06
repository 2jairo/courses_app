package courseprogress

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type UpdateCourseProgressRequest struct {
	Body struct {
		CourseID  int64 `json:"courseId" validate:"required"`
		LectureID int64 `json:"lectureId" validate:"required"`
	}
}

func (req *UpdateCourseProgressRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(&req.Body, ctx.BodyParser)
}

type ResetCourseProgressRequest struct {
	Body struct {
		CourseID int64 `json:"courseId" validate:"required"`
	}
}

func (req *ResetCourseProgressRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(&req.Body, ctx.BodyParser)
}
