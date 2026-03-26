package entity

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type QuizQuestionStatus string

const (
	QuizQuestionStatusPublic  QuizQuestionStatus = "Public"
	QuizQuestionStatusPrivate QuizQuestionStatus = "Private"
)

func (s QuizQuestionStatus) IsValid() bool {
	return s == QuizQuestionStatusPublic || s == QuizQuestionStatusPrivate
}

type QuizQuestionKind string

const (
	QuizQuestionKindBoolMultiple QuizQuestionKind = "BoolMultiple" // checkbox (multiple correct answers)
	QuizQuestionKindBoolSingle   QuizQuestionKind = "BoolSingle"   // radio (single correct answer)
	QuizQuestionKindTextMultiple QuizQuestionKind = "TextMultiple" // guess multiple keywords
	QuizQuestionKindTextSingle   QuizQuestionKind = "TextSingle"   // guess single keyword
	QuizQuestionKindMatch        QuizQuestionKind = "Match"        // match keys:values
	QuizQuestionKindOrdering     QuizQuestionKind = "Ordering"     // sort keywords
)

func (k QuizQuestionKind) IsValid() bool {
	return k == QuizQuestionKindBoolMultiple ||
		k == QuizQuestionKindBoolSingle ||
		k == QuizQuestionKindTextMultiple ||
		k == QuizQuestionKindTextSingle ||
		k == QuizQuestionKindMatch ||
		k == QuizQuestionKindOrdering
}

type QuizQuestion struct {
	entitycommon.Model
	QuizID       entitycommon.Id
	Position     int32
	Status       QuizQuestionStatus `gorm:"type:QuizQuestionStatus"`
	Kind         QuizQuestionKind   `gorm:"type:QuizQuestionKind"`
	QuestionText string
	Options      datatypes.JSON `gorm:"type:jsonb"`
	Explanation  *string        `gorm:"default:null"`
	Points       int32          `gorm:"default:1"`

	// relations
	Quiz *LectureQuiz `gorm:"foreignKey:QuizID"`
}

type QuizQuestionPreloadOptions struct {
	Quiz bool
}

func (p *QuizQuestionPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.Quiz {
		query.Preload(prefix + "Quiz")
	}
}
