package state

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/middleware"
	"github.com/2jairo/courses_app/backend/A_core_service/repository"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type AppState struct {
	VideoService   repository.VideoRepository
	AuthMiddleware middleware.AuthMiddleware
}

func New() *AppState {
	dbs := db.NewDatabasesConnection()
	s2sJwtRepository := utils.NewS2SJwtRepository()

	return &AppState{
		VideoService:   repository.VideoRepository{Db: dbs},
		AuthMiddleware: middleware.AuthMiddleware{S2SJwt: s2sJwtRepository},
	}
}
