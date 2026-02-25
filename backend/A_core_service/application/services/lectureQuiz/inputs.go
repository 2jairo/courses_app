package lecturequiz

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"gorm.io/datatypes"
)

// --- Quiz inputs ---

type CreateQuizInput struct {
	CourseId               entitycommon.Id
	Title                  string
	TimeLimitSecs          *int32
	PassingScorePercentage *int32
	ShuffleQuestions       *bool
	ShowCorrectAnswers     *bool
}

type DeleteQuizInput struct {
	QuizID entitycommon.Id
}

type GetQuizzesInput struct {
	CourseId     entitycommon.Id
	Pagination   *utils.Pagination
	QueryByTitle string
	SortOrder    *utils.SortOrder
	SortBy       *entity.QuizSortBy
}

// --- Question inputs ---

type CreateQuestionInput struct {
	QuizID       entitycommon.Id
	Status       entity.QuizQuestionStatus
	Kind         entity.QuizQuestionKind
	QuestionText string
	Options      datatypes.JSON
	Explanation  *string
	Points       int32
}

type UpdateQuestionInput struct {
	QuestionID   entitycommon.Id
	Status       *entity.QuizQuestionStatus
	Kind         *entity.QuizQuestionKind
	QuestionText *string
	Options      *datatypes.JSON
	Explanation  *string
	Points       *int32
}

type DeleteQuestionInput struct {
	QuestionID entitycommon.Id
}

type UpdateQuestionPositionInput struct {
	QuestionID  entitycommon.Id
	QuizID      entitycommon.Id
	NewPosition int32
}

type StartAttemptInput struct {
	LectureSlug entitycommon.Slug
	UserID      entitycommon.Id
}

type SetAnswerInput struct {
	UserID      entitycommon.Id
	LectureSlug entitycommon.Slug
	QuestionID  entitycommon.Id
	Answer      []byte // raw JSON
}

type FinishAttemptInput struct {
	UserID      entitycommon.Id
	LectureSlug entitycommon.Slug
}
