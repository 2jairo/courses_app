package lecturequiz

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/datatypes"
)

type CreateQuizOutput struct {
	Quiz *entity.LectureQuiz
}

type GetQuizzesOutput struct {
	Quizzes []entity.LectureQuiz
}

type CreateQuestionOutput struct {
	Question *entity.QuizQuestion
}

type StartAttemptOutput struct {
	Quiz    *entity.LectureQuiz
	Lecture *entity.Lecture
	Attempt *entity.QuizAttempt
}

type CheckAnswerOutput struct {
	IsCorrect    bool
	PointsEarned float64
}

type FinishAttemptOutput struct {
	Attempt *entity.QuizAttempt
	Quiz    *entity.LectureQuiz
}

type AttemptAnswerDetail struct {
	QuestionID   entitycommon.Id
	Position     int32
	QuestionText string
	Kind         entity.QuizQuestionKind
	MaxPoints    int32
	PointsEarned float64
	IsCorrect    bool
	Answer       datatypes.JSON
	Explanation  *string
	// Populated only when ShowCorrectAnswers is true
	CorrectOptions datatypes.JSON
}

type GetAttemptDetailsOutput struct {
	Attempt *entity.QuizAttempt
	Quiz    *entity.LectureQuiz
}
