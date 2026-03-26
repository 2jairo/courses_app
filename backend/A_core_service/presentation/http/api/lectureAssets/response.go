package lectureassets

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/api/files"
)

type LectureAssetResponse struct {
	ID        int64                      `json:"id"`
	LectureID int64                      `json:"lectureId"`
	FileID    int64                      `json:"fileId"`
	File      *files.UploadFilesResponse `json:"file,omitempty"`
	CreatedAt time.Time                  `json:"createdAt"`
}

func getResponse(lectureAssets []entity.LectureAsset) []LectureAssetResponse {
	resp := make([]LectureAssetResponse, len(lectureAssets))

	for i, asset := range lectureAssets {
		assetResponse := LectureAssetResponse{
			ID:        int64(asset.ID),
			LectureID: int64(asset.LectureID),
			FileID:    int64(asset.FileID),
			CreatedAt: asset.CreatedAt,
		}

		if asset.File.ID != 0 {
			item := &files.UploadFilesResponse{}
			itemFill := item.FromEntity(asset.File)
			assetResponse.File = &itemFill
		}
		resp[i] = assetResponse
	}

	return resp
}

func (self *SetFilesToLectureRequest) getResponse(lectureAssets []entity.LectureAsset) []LectureAssetResponse {
	return getResponse(lectureAssets)
}

func (self *GetLectureFilesRequest) getResponse(lectureAssets []entity.LectureAsset) []LectureAssetResponse {
	return getResponse(lectureAssets)
}
