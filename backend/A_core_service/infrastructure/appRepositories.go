package infrastructure

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure/repository"
)

type AppRepositories struct {
	User              repository.UserRepository
	Course            repository.CourseRepository
	CoursePermissions repository.CoursePermissionsRepository
	CourseSection     repository.CourseSectionRepository
	CourseProgress    repository.CourseProgressRepository
	CourseReview      repository.CourseReviewRepository
	FavoriteCourse    repository.FavoriteCourseRepository
	Lecture           repository.LectureRepository
	LectureComment    repository.LectureCommentRepository
	LectureVideo      repository.LectureVideoRepository
	LectureDocument   repository.LectureDocumentRepository
	LectureAsset      repository.LectureAssetRepository
	LectureQuiz       repository.LectureQuizRepository
	QuizQuestion      repository.QuizQuestionRepository
	QuizAttempt       repository.QuizAttemptRepository
	QuizAttemptAnswer repository.QuizAttemptAnswerRepository
	File              repository.FileRepository
	Analytics         repository.AnalyticsRepository
}

func NewAppRepositories(dbs *db.DatabasesConnection) *AppRepositories {
	return &AppRepositories{
		User:              repository.UserRepository{Db: dbs},
		Course:            repository.CourseRepository{Db: dbs},
		CoursePermissions: repository.CoursePermissionsRepository{Db: dbs},
		CourseSection:     repository.CourseSectionRepository{Db: dbs},
		CourseProgress:    repository.CourseProgressRepository{Db: dbs},
		CourseReview:      repository.CourseReviewRepository{Db: dbs},
		FavoriteCourse:    repository.FavoriteCourseRepository{Db: dbs},
		Lecture:           repository.LectureRepository{Db: dbs},
		LectureComment:    repository.LectureCommentRepository{Db: dbs},
		LectureVideo:      repository.LectureVideoRepository{Db: dbs},
		LectureDocument:   repository.LectureDocumentRepository{Db: dbs},
		LectureAsset:      repository.LectureAssetRepository{Db: dbs},
		LectureQuiz:       repository.LectureQuizRepository{Db: dbs},
		QuizQuestion:      repository.QuizQuestionRepository{Db: dbs},
		QuizAttempt:       repository.QuizAttemptRepository{Db: dbs},
		QuizAttemptAnswer: repository.QuizAttemptAnswerRepository{Db: dbs},
		File:              repository.FileRepository{Db: dbs},
		Analytics:         repository.AnalyticsRepository{Db: dbs},
	}
}
