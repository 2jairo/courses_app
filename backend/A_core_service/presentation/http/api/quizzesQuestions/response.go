package quizzesquestions

import (
	"encoding/json"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type QuizQuestionResponse struct {
	ID           int64                     `json:"id"`
	QuizID       int64                     `json:"quizId"`
	Position     int32                     `json:"position"`
	Status       entity.QuizQuestionStatus `json:"status"`
	Kind         entity.QuizQuestionKind   `json:"kind"`
	QuestionText string                    `json:"questionText"`
	Options      json.RawMessage           `json:"options"`
	Explanation  *string                   `json:"explanation"`
	Points       int32                     `json:"points"`
	CreatedAt    time.Time                 `json:"createdAt"`
}

func questionToResponse(q *entity.QuizQuestion) QuizQuestionResponse {
	return QuizQuestionResponse{
		ID:           int64(q.ID),
		QuizID:       int64(q.QuizID),
		Position:     q.Position,
		Status:       q.Status,
		Kind:         q.Kind,
		QuestionText: q.QuestionText,
		Options:      json.RawMessage(q.Options),
		Explanation:  q.Explanation,
		Points:       q.Points,
		CreatedAt:    q.CreatedAt,
	}
}

func (self *CreateQuestionRequest) getResponse(q *entity.QuizQuestion) QuizQuestionResponse {
	return questionToResponse(q)
}

func (self *UpdateQuestionRequest) getResponse(q *entity.QuizQuestion) QuizQuestionResponse {
	return questionToResponse(q)
}
