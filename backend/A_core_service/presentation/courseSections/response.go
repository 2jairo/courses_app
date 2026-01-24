package coursesections

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type CourseSectionResponse struct {
	ID   int64  `json:"id"`
	Slug string `json:"slug"`
	// CourseUpdatedAt time.Time `json:"courseUpdatedAt"`
	Position int    `json:"position"`
	Title    string `json:"title"`
}

func (self *CreateCourseSectionRequest) getResponse(courseSection *entity.CourseSection) *CourseSectionResponse {
	return &CourseSectionResponse{
		ID:       courseSection.ID,
		Position: courseSection.Position,
		Title:    courseSection.Title,
		Slug:     courseSection.Slug.Slug,
		// CourseUpdatedAt: updatedAt,
	}
}

func (self *UpdateCourseSectionRequest) getResponse(courseSection *entity.CourseSection) *CourseSectionResponse {
	return &CourseSectionResponse{
		ID:       courseSection.ID,
		Position: courseSection.Position,
		Title:    courseSection.Title,
		Slug:     courseSection.Slug.Slug,
		// CourseUpdatedAt: updatedAt,
	}
}
