package image

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type ImageMsgHandler struct {
	Services *services.AppServices
}

func (self *ImageMsgHandler) UpdateMetadata(rawMsg []byte, metadataValues map[string]any) (entity.FileStatus, error) {
	return self.Services.File.UpdateFileImageMetadata(rawMsg, metadataValues)
}
