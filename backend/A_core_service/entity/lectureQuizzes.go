package entity

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type LectureQuiz struct {
	entitycommon.Model
	CourseID               entitycommon.Id
	Title                  string `gorm:"default:''"`
	TimeLimitSecs          *int32 `gorm:"default:null"`
	PassingScorePercentage int32  `gorm:"default:70"`
	ShuffleQuestions       bool   `gorm:"default:false"`
	ShowCorrectAnswers     bool   `gorm:"default:true"`
	QuestionsAmount        int32  `gorm:"default:0"`
	PublicQuestionsAmount  int32  `gorm:"default:0"`

	// relations
	Questions []QuizQuestion `gorm:"foreignKey:QuizID"`
}

func (LectureQuiz) TableName() string {
	return "lecture_quizzes"
}

type LectureQuizPreloadOptions struct {
	Questions bool
	QuizQuestionPreloadOptions
}

func (p *LectureQuizPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.Questions {
		query.Preload(prefix + "Questions")
		p.QuizQuestionPreloadOptions.Preload(query, prefix+"Questions.")
	}
}

type QuizSortBy string

const (
	QuizSortByDate         QuizSortBy = "date"
	QuizSortByTitle        QuizSortBy = "title"
	QuizSortByTimeLimit    QuizSortBy = "timeLimit"
	QuizSortByPassingScore QuizSortBy = "passingScore"
)

func (s QuizSortBy) IsValid() bool {
	return QuizSortByDate == s ||
		QuizSortByTitle == s ||
		QuizSortByTimeLimit == s ||
		QuizSortByPassingScore == s
}
func (s QuizSortBy) Column() string {
	switch s {
	case QuizSortByDate:
		return "created_at"
	case QuizSortByTitle:
		return "title"
	case QuizSortByTimeLimit:
		return "time_limit_secs"
	case QuizSortByPassingScore:
		return "passing_score_percentage"
	}
	return ""
}
