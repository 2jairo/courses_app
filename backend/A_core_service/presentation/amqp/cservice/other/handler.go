package other

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type OtherMsgHandler struct {
	Services *services.AppServices
}

func (self *OtherMsgHandler) UpdateMetadata(rawMsg []byte, metadataValues map[string]any) (entity.FileStatus, error) {
	return self.Services.File.UpdateFileOtherMetadata(rawMsg, metadataValues)
}
