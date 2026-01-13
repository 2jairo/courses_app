package courses

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type CourseResponse struct {
	UpdatedAt       time.Time               `json:"updatedAt"`
	Visibility      entity.CourseVisibility `json:"visibility"`
	Slug            string                  `json:"slug"`
	Title           string                  `json:"title"`
	Description     string                  `json:"description"`
	Poster          *string                 `json:"poster"`
	LecturesAmmount int32                   `json:"lecturesAmmount"`
}

func createOrUpdateCourseResponse(course *entity.Course) *CourseResponse {
	return &CourseResponse{
		UpdatedAt:       course.UpdatedAt,
		Visibility:      course.Visibility,
		Slug:            course.Slug.Slug,
		Title:           course.Title,
		Description:     course.Description,
		Poster:          course.Poster,
		LecturesAmmount: course.LecturesAmount,
	}
}

func (self *CreateCourseRequest) getResponse(course *entity.Course) *CourseResponse {
	return createOrUpdateCourseResponse(course)
}

func (self *UpdateCourseRequest) getResponse(course *entity.Course) *CourseResponse {
	return createOrUpdateCourseResponse(course)
}
