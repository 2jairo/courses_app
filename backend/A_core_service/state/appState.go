package state

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/middleware"
	"github.com/2jairo/courses_app/backend/A_core_service/repository"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

// TODO: split move repository.* to other struct (that services will call)
type AppState struct {
	Validator            utils.Validator
	AuthMiddleware       middleware.AuthMiddleware
	CourseRoleMiddleware middleware.CoursePermissionMiddleware

	// Database connection (for direct access when needed)
	Db *db.DatabasesConnection

	UserRepository              repository.UserRepository
	CourseRepository            repository.CourseRepository
	CoursePermissionsRepository repository.CoursePermissionsRepository
	CourseSectionRepository     repository.CourseSectionRepository
	CourseProgressRepository    repository.CourseProgressRepository
	LectureRepository           repository.LectureRepository
	LectureVideoRepository      repository.LectureVideoRepository
	LectureDocumentRepository   repository.LectureDocumentRepository
	LectureAssetRepository      repository.LectureAssetRepository
	FileRepository              repository.FileRepository
	AnalyticsRepository         repository.AnalyticsRepository
}

func NewAppState(dbs *db.DatabasesConnection) *AppState {
	s2sJwtRepository := utils.NewS2SJwtRepository()

	return &AppState{
		Validator:      utils.NewValidator(),
		AuthMiddleware: middleware.AuthMiddleware{S2SJwt: s2sJwtRepository},
		CourseRoleMiddleware: middleware.CoursePermissionMiddleware{
			CoursePermissionsRepository: &repository.CoursePermissionsRepository{Db: dbs},
		},

		// Add database connection for direct access
		Db: dbs,

		UserRepository:              repository.UserRepository{Db: dbs},
		CourseRepository:            repository.CourseRepository{Db: dbs},
		CoursePermissionsRepository: repository.CoursePermissionsRepository{Db: dbs},
		CourseSectionRepository:     repository.CourseSectionRepository{Db: dbs},
		CourseProgressRepository:    repository.CourseProgressRepository{Db: dbs},
		LectureRepository:           repository.LectureRepository{Db: dbs},
		LectureVideoRepository:      repository.LectureVideoRepository{Db: dbs},
		LectureDocumentRepository:   repository.LectureDocumentRepository{Db: dbs},
		LectureAssetRepository:      repository.LectureAssetRepository{Db: dbs},
		FileRepository:              repository.FileRepository{Db: dbs},
		AnalyticsRepository:         repository.AnalyticsRepository{Db: dbs},
	}
}

func (state *AppState) DefaultBind(self interface{}, parser func(i interface{}) error) error {
	if err := parser(self); err != nil {
		return err
	}
	if err := state.Validator.Validate(self); err != nil {
		return err
	}

	return nil
}
