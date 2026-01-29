package courseprogress

import (
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

type UpdateCourseProgressRequest struct {
	Body struct {
		CourseID  int64 `json:"courseId" validate:"required"`
		LectureID int64 `json:"lectureId" validate:"required"`
	}
}

func (req *UpdateCourseProgressRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(&req.Body, ctx.BodyParser)
}
