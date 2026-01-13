package coursesections

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
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

type CourseSectionResponse struct {
	Slug            string    `json:"slug"`
	CourseUpdatedAt time.Time `json:"courseUpdatedAt"`
	Position        int       `json:"position"`
	Title           string    `json:"title"`
}

func (self *CreateCourseSectionRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(self, ctx.BodyParser)
}

func (self *CreateCourseSectionRequest) getResponse(courseSection *entity.CourseSection, updatedAt time.Time) *CourseSectionResponse {
	return &CourseSectionResponse{
		Position:        courseSection.Position, //TODO
		Title:           courseSection.Title,
		Slug:            courseSection.Slug.Slug,
		CourseUpdatedAt: updatedAt,
	}
}

func (self *DeleteCourseSectionRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(self, ctx.ParamsParser)
}
