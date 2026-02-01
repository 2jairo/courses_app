package cservicevideo

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
)

type CserviceVideoService struct {
	Repo *state.AppState
}

func (h *CserviceVideoService) UpdateMetadata(rawMsg []byte, metadataValues map[string]any) (entity.FileStatus, error) {
	data := &CServiceProcessVideoResponse{}
	if err := data.UnmarshalJSON(rawMsg); err != nil {
		return entity.FileStatusProcessing, err
	}

	newFileStatus := entity.FileStatusProcessing

	switch data.Variant {
	case CServiceProcessVideoVariantEnumInfo:
		body := data.Body.(CServiceProcessVideoVariantInfo)
		metadataValues["duration"] = body.Duration

	case CServiceProcessVideoVariantEnumResolutions:
		body := data.Body.(CServiceProcessVideoVariantResolutions)
		metadataValues["resolutions"] = body.ResolutionsFramerate
		metadataValues["mediaPlaylist"] = body.MediaPlaylist

	case CServiceProcessVideoVariantEnumPoster:
		body := data.Body.(CServiceProcessVideoVariantPoster)
		metadataValues["poster"] = body.Path

	case CServiceProcessVideoVariantEnumThumbnails:
		body := data.Body.(CServiceProcessVideoVariantThumbnails)
		metadataValues["thumbnails"] = body.Path

	case CServiceProcessVideoVariantEnumSpeechToText:
		body := data.Body.(CServiceProcessVideoVariantSpeechToText)
		metadataValues["subtitles"] = body.Languages
		newFileStatus = entity.FileStatusReady

	case CServiceProcessVideoVariantEnumError:
		body := data.Body.(CServiceProcessVideoVariantError)
		metadataValues["error"] = body.Error
		newFileStatus = entity.FileStatusFailed
	}

	return newFileStatus, nil
}
