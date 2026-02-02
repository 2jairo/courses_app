package video

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type VideoMsgHandler struct {
	Services *services.AppServices
}

func (self *VideoMsgHandler) UpdateMetadata(rawMsg []byte, metadataValues map[string]any) (entity.FileStatus, error) {
	return self.Services.File.UpdateFileVideoMetadata(rawMsg, metadataValues)
}
