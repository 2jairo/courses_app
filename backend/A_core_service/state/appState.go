package state

import (
	"fmt"

	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/repository"
	"gorm.io/gorm"
)

type DatabasesConnection struct {
	pg *gorm.DB
}

type AppState struct {
	VideoService repository.VideoRepository
}

func New() *AppState {
	pg, err := db.PgNew()
	if err != nil {
		panic(fmt.Sprintf("Failed to initialize app state: %s", err))
	}

	return &AppState{
		VideoService: repository.NewVideoRepository(pg),
	}
}
