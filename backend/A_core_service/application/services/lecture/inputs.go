package lecture

import (
	"encoding/json"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
)

// GetLectureInput contains input parameters for GetLecture
type GetLectureInput struct {
	LectureID   entitycommon.Id // id or slug
	LectureSlug entitycommon.Slug
	UserId      entitycommon.Id // pass only to get LectureExtraData
}

// CreateLectureInput contains input parameters for CreateLecture
type CreateLectureInput struct {
	Title           string
	Description     string
	Visibility      entity.LectureVisibility
	CourseSectionID entitycommon.Id
	LectureKind     entity.LectureKind
	LectureDataBody any
}

// UpdateLectureInput contains input parameters for UpdateLecture
type UpdateLectureInput struct {
	LectureID       entitycommon.Id
	Title           *string
	Description     *string
	Visibility      *entity.LectureVisibility
	LectureKind     *entity.LectureKind
	LectureDataBody any
}

// DeleteLectureInput contains input parameters for DeleteLecture
type DeleteLectureInput struct {
	LectureID entitycommon.Id
}

// UpdateLecturePositionInput contains input parameters for UpdateLecturePosition
type UpdateLecturePositionInput struct {
	LectureID       entitycommon.Id
	CourseSectionID entitycommon.Id
	NewPosition     int
}

// MoveLectureToSectionInput contains input parameters for MoveLectureToSection
type MoveLectureToSectionInput struct {
	LectureID          entitycommon.Id
	NewCourseSectionID entitycommon.Id
}

// Data structures for lecture kinds
type CreateLectureDataKindVideo struct {
	FileId int64
}

type CreateLectureDataKindDocument struct {
	Body json.RawMessage
}

type CreateLectureDataKindQuiz struct {
	QuizId int64
}
