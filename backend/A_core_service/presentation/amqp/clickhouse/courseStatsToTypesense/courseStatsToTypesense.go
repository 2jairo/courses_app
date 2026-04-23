package coursestatstotypesense

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type CourseStatsToTypesenseMsgHandler struct {
	Services *services.AppServices
}

func (self *CourseStatsToTypesenseMsgHandler) UpdateStats(rawMsg []byte, metadataValues map[string]any) (entity.FileStatus, error) {
	return self.Services.File.UpdateFileImageMetadata(rawMsg, metadataValues)
}
