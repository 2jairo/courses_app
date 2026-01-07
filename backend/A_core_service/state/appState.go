package state

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/middleware"
	"github.com/2jairo/courses_app/backend/A_core_service/repository"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type AppState struct {
	Validator               utils.Validator
	AuthMiddleware          middleware.AuthMiddleware
	CourseRepository        repository.CourseRepository
	CourseSectionRepository repository.CourseSectionRepository
}

func New() *AppState {
	dbs := db.NewDatabasesConnection()
	s2sJwtRepository := utils.NewS2SJwtRepository()

	return &AppState{
		Validator:               utils.NewValidator(),
		AuthMiddleware:          middleware.AuthMiddleware{S2SJwt: s2sJwtRepository},
		CourseRepository:        repository.CourseRepository{Db: dbs},
		CourseSectionRepository: repository.CourseSectionRepository{Db: dbs},
	}
}

func (state *AppState) DefaultBind(self interface{}, ctx *fiber.Ctx) error {
	if err := ctx.BodyParser(self); err != nil {
		return err
	}
	if err := state.Validator.Validate(self); err != nil {
		return err
	}

	return nil
}
