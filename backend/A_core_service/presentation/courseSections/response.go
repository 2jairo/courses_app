package coursesections

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type CourseSectionResponse struct {
	Slug            string    `json:"slug"`
	CourseUpdatedAt time.Time `json:"courseUpdatedAt"`
	Position        int       `json:"position"`
	Title           string    `json:"title"`
}

func (self *CreateCourseSectionRequest) getResponse(courseSection *entity.CourseSection, updatedAt time.Time) *CourseSectionResponse {
	return &CourseSectionResponse{
		Position:        courseSection.Position, //TODO
		Title:           courseSection.Title,
		Slug:            courseSection.Slug.Slug,
		CourseUpdatedAt: updatedAt,
	}
}
