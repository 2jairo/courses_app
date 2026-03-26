package entity

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type QuizAttemptAnswer struct {
	entitycommon.Model

	AttemptID    entitycommon.Id
	QuestionID   entitycommon.Id
	IsCorrect    bool
	PointsEarned float64        `gorm:"default:0"`
	Answer       datatypes.JSON `gorm:"type:jsonb;default:'{}'"`

	// relations
	Attempt  *QuizAttempt  `gorm:"foreignKey:AttemptID"`
	Question *QuizQuestion `gorm:"foreignKey:QuestionID"`
}

type QuizAttemptAnswerPreloadOptions struct {
	Attempt  bool
	Question bool
}

func (p *QuizAttemptAnswerPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.Attempt {
		query.Preload(prefix + "Attempt")
	}
	if p.Question {
		query.Preload(prefix + "Question")
	}
}
