package state

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/middleware"
	"github.com/2jairo/courses_app/backend/A_core_service/repository"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type AppState struct {
	Validator               utils.Validator
	AuthMiddleware          middleware.AuthMiddleware
	CourseRepository        repository.CourseRepository
	CourseSectionRepository repository.CourseSectionRepository
	LectureRepository       repository.LectureRepository
	FileRepository          repository.FileRepository
}

func New(dbs *db.DatabasesConnection) *AppState {
	s2sJwtRepository := utils.NewS2SJwtRepository()

	return &AppState{
		Validator:               utils.NewValidator(),
		AuthMiddleware:          middleware.AuthMiddleware{S2SJwt: s2sJwtRepository},
		CourseRepository:        repository.CourseRepository{Db: dbs},
		CourseSectionRepository: repository.CourseSectionRepository{Db: dbs},
		LectureRepository:       repository.LectureRepository{Db: dbs},
		FileRepository:          repository.FileRepository{Db: dbs},
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
