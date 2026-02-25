package lecturequiz

import "github.com/2jairo/courses_app/backend/A_core_service/entity"

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
	Explanation  *string
}

type FinishAttemptOutput struct {
	Attempt *entity.QuizAttempt
	Quiz    *entity.LectureQuiz
}
