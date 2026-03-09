package quizzes

import (
	"encoding/json"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type QuizResponse struct {
	ID                     int64     `json:"id"`
	Title                  string    `json:"title"`
	TimeLimitSecs          *int32    `json:"timeLimitSecs"`
	PassingScorePercentage int32     `json:"passingScorePercentage"`
	ShuffleQuestions       bool      `json:"shuffleQuestions"`
	ShowCorrectAnswers     bool      `json:"showCorrectAnswers"`
	CreatedAt              time.Time `json:"createdAt"`
	QuestionsAmount        int32     `json:"questionsAmount"`
	PublicQuestionsAmount  int32     `json:"publicQuestionsAmount"`
}

type ExtendedQuizResponse struct {
	*QuizResponse
	Questions []ExtendedQuizResponseQuestion `json:"questions"`
}
type ExtendedQuizResponseQuestion struct {
	ID           int64                     `json:"id"`
	QuizID       int64                     `json:"quizId"`
	Position     int32                     `json:"position"`
	Kind         entity.QuizQuestionKind   `json:"kind"`
	Status       entity.QuizQuestionStatus `json:"status"`
	QuestionText string                    `json:"questionText"`
	Options      any                       `json:"options"`
	Explanation  *string                   `json:"explanation"`
	Points       int32                     `json:"points"`
	CreatedAt    time.Time                 `json:"createdAt"`
}

func quizToResponse(q *entity.LectureQuiz) QuizResponse {
	return QuizResponse{
		ID:                     int64(q.ID),
		Title:                  q.Title,
		TimeLimitSecs:          q.TimeLimitSecs,
		PassingScorePercentage: q.PassingScorePercentage,
		ShuffleQuestions:       q.ShuffleQuestions,
		ShowCorrectAnswers:     q.ShowCorrectAnswers,
		CreatedAt:              q.CreatedAt,
		QuestionsAmount:        q.QuestionsAmount,
		PublicQuestionsAmount:  q.PublicQuestionsAmount,
	}
}

func (self *CreateQuizRequest) getResponse(q *entity.LectureQuiz) QuizResponse {
	return quizToResponse(q)
}

func (self *GetQuizzesRequest) getResponse(quizzes []entity.LectureQuiz) []QuizResponse {
	responses := make([]QuizResponse, len(quizzes))
	for i, q := range quizzes {
		responses[i] = quizToResponse(&q)
	}
	return responses
}

func (self *UpdateQuizRequest) getResponse(q *entity.LectureQuiz) QuizResponse {
	return quizToResponse(q)
}

func (self *GetQuizDetailsRequest) getResponse(q *entity.LectureQuiz) ExtendedQuizResponse {
	quiz := quizToResponse(q)
	questions := make([]ExtendedQuizResponseQuestion, len(q.Questions))

	for i, question := range q.Questions {
		questions[i] = ExtendedQuizResponseQuestion{
			ID:           int64(question.ID),
			QuizID:       int64(question.QuizID),
			Position:     question.Position,
			Kind:         question.Kind,
			Status:       question.Status,
			QuestionText: question.QuestionText,
			Options:      json.RawMessage(question.Options),
			Explanation:  question.Explanation,
			Points:       question.Points,
			CreatedAt:    question.CreatedAt,
		}
	}

	return ExtendedQuizResponse{
		QuizResponse: &quiz,
		Questions:    questions,
	}
}
