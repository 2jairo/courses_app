package cserviceimage

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
)

type CServiceImageService struct {
	Repo *state.AppState
}

func (self *CServiceImageService) UpdateMetadata(rawMsg []byte, metadataValues map[string]any) (entity.FileStatus, error) {
	data := &CServiceProcessImageResponse{}
	if err := data.UnmarshalJSON(rawMsg); err != nil {
		return entity.FileStatusProcessing, err
	}

	newFileStatus := entity.FileStatusProcessing

	switch data.Variant {
	case CServiceProcessImageVariantEnumResolutions:
		body := data.Body.(CServiceProcessImageVariantResolutions)
		metadataValues["resolutions"] = body.Resolutions
		newFileStatus = entity.FileStatusReady

	case CServiceProcessImageVariantEnumError:
		body := data.Body.(CServiceProcessImageVariantError)
		metadataValues["error"] = body.Error
		newFileStatus = entity.FileStatusFailed
	}

	return newFileStatus, nil

}
