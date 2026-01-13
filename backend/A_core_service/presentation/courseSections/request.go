package coursesections

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

type CreateCourseSectionRequest struct {
	CourseSlug      string    `json:"courseSlug" validate:"required"`
	CourseUpdatedAt time.Time `json:"courseUpdatedAt" validate:"required"`
	Title           string    `json:"title" validate:"required,min=3,max=100"`
}

type DeleteCourseSectionRequest struct {
	SectionSlug string
}

func (self *CreateCourseSectionRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(self, ctx.BodyParser)
}

func (self *DeleteCourseSectionRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(self, ctx.ParamsParser)
}
