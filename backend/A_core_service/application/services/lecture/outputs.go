package lecture

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

// GetLectureOutput contains output data for GetLecture
type GetLectureOutput struct {
	Lecture          *entity.Lecture
	LectureData      any
	LectureExtraData any
	CourseSection    *entity.CourseSection
}

// CreateLectureOutput contains output data for CreateLecture
type CreateLectureOutput struct {
	Lecture       *entity.Lecture
	LectureData   any
	CourseSection *entity.CourseSection
}

// UpdateLectureOutput contains output data for UpdateLecture
type UpdateLectureOutput struct {
	Lecture     *entity.Lecture
	LectureData any
}
