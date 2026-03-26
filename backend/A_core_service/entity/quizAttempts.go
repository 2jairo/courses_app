package entity

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type QuizAttempt struct {
	entitycommon.Model
	ExpiresAt   *time.Time `gorm:"type:timestamptz"`
	CompletedAt *time.Time `gorm:"type:timestamptz"`
	UserID      entitycommon.Id
	LectureID   entitycommon.Id

	MaxPoints              float64 `gorm:"type:DOUBLE PRECISION;default:0"`
	PointsEarned           float64 `gorm:"type:DOUBLE PRECISION;default:0"`
	PassingScorePercentage int32   `gorm:"default:70"`
	Passed                 bool    `gorm:"default:false"`

	// relations
	User    *User               `gorm:"foreignKey:UserID"`
	Lecture *Lecture            `gorm:"foreignKey:LectureID"`
	Answers []QuizAttemptAnswer `gorm:"foreignKey:AttemptID"`
}

type QuizAttemptPreloadOptions struct {
	User    bool
	Lecture bool
	Answers bool
	QuizAttemptAnswerPreloadOptions
}

func (p *QuizAttemptPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.User {
		query.Preload(prefix + "User")
	}
	if p.Lecture {
		query.Preload(prefix + "Lecture")
	}
	if p.Answers {
		query.Preload(prefix + "Answers")
		p.QuizAttemptAnswerPreloadOptions.Preload(query, prefix+"Answers.")
	}
}
