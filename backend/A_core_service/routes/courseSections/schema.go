package coursesections

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

type CreateCourseSectionRequest struct {
	CourseID int64  `json:"courseId" validate:"required"`
	Position int    `json:"position" validate:"required,min=1"`
	Title    string `json:"title" validate:"required,min=3,max=100"`
}

type CourseSectionResponse struct {
	ID       int64  `json:"id"`
	CourseID int64  `json:"courseId"`
	Position int    `json:"position"`
	Title    string `json:"title"`
}

func (self *CreateCourseSectionRequest) bind(state *state.AppState, ctx *fiber.Ctx, courseSection *entity.CourseSection) error {
	if err := state.DefaultBind(self, ctx); err != nil {
		return err
	}

	courseSection.CourseID = self.CourseID
	courseSection.Position = self.Position
	courseSection.Title = self.Title

	return nil
}

func (self *CreateCourseSectionRequest) getResponse(courseSection *entity.CourseSection) *CourseSectionResponse {
	return &CourseSectionResponse{
		ID:       courseSection.ID,
		CourseID: courseSection.CourseID,
		Position: courseSection.Position,
		Title:    courseSection.Title,
	}
}
