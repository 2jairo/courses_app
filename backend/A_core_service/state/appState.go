package state

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/middleware"
	"github.com/2jairo/courses_app/backend/A_core_service/repository"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type AppState struct {
	Validator            utils.Validator
	AuthMiddleware       middleware.AuthMiddleware
	CourseRoleMiddleware middleware.CoursePermissionMiddleware

	UserRepository              repository.UserRepository
	CourseRepository            repository.CourseRepository
	CoursePermissionsRepository repository.CoursePermissionsRepository
	CourseSectionRepository     repository.CourseSectionRepository
	LectureRepository           repository.LectureRepository
	LectureVideoRepository      repository.LectureVideoRepository
	FileRepository              repository.FileRepository
}

func New(dbs *db.DatabasesConnection) *AppState {
	s2sJwtRepository := utils.NewS2SJwtRepository()

	return &AppState{
		Validator:      utils.NewValidator(),
		AuthMiddleware: middleware.AuthMiddleware{S2SJwt: s2sJwtRepository},
		CourseRoleMiddleware: middleware.CoursePermissionMiddleware{
			CoursePermissionsRepository: &repository.CoursePermissionsRepository{Db: dbs},
		},

		UserRepository:              repository.UserRepository{Db: dbs},
		CourseRepository:            repository.CourseRepository{Db: dbs},
		CoursePermissionsRepository: repository.CoursePermissionsRepository{Db: dbs},
		CourseSectionRepository:     repository.CourseSectionRepository{Db: dbs},
		LectureRepository:           repository.LectureRepository{Db: dbs},
		LectureVideoRepository:      repository.LectureVideoRepository{Db: dbs},
		FileRepository:              repository.FileRepository{Db: dbs},
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
