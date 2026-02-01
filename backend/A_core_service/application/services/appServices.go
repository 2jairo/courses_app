package services

import (
	cserviceimage "github.com/2jairo/courses_app/backend/A_core_service/application/services/cserviceImage"
	cservicevideo "github.com/2jairo/courses_app/backend/A_core_service/application/services/cserviceVideo"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
)

type AppServices struct {
	CServiceImage cserviceimage.CServiceImageService
	CServiceVideo cservicevideo.CserviceVideoService
}

func NewAppServices(appState *state.AppState) *AppServices {
	return &AppServices{
		CServiceImage: cserviceimage.CServiceImageService{Repo: appState},
		CServiceVideo: cservicevideo.CserviceVideoService{Repo: appState},
	}
}
