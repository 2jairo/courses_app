package files

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type UploadFilesResponse struct {
	ID           int64                   `json:"id"`
	CreatedAt    time.Time               `json:"createdAt"`
	Status       entity.FileStatus       `json:"status"`
	Kind         entity.FileKind         `json:"kind"`
	OriginalName string                  `json:"originalName"`
	FileSize     int64                   `json:"fileSize"`
	Metadata     any                     `json:"metadata"`
	User         UploadFilesResponseUser `json:"user"`
	Cdn          utils.CdnResponse       `json:"cdn"`
}

func (self *UploadFilesResponse) FromEntity(file *entity.File) UploadFilesResponse {
	var avatar *string = nil
	if file.User.Avatar != nil {
		path := file.User.Avatar.CdnImageUrl()
		avatar = &path
	}

	return UploadFilesResponse{
		ID:           int64(file.ID),
		CreatedAt:    file.CreatedAt,
		Status:       file.Status,
		Kind:         file.Kind,
		OriginalName: file.OriginalName,
		FileSize:     file.FileSize,
		Metadata:     file.Metadata,
		User: UploadFilesResponseUser{
			Username: file.User.Username,
			ID:       int64(file.User.ID),
			Avatar:   avatar,
		},
		Cdn: utils.CdnResponse{
			Base: config.CdnServiceUrl.FileBaseUrl(int64(file.ID)),
		},
	}
}

type UploadFilesResponseUser struct {
	Username string  `json:"username"`
	ID       int64   `json:"id"`
	Avatar   *string `json:"avatar"`
}

func filesResponse(uploadedFiles []entity.File) []UploadFilesResponse {
	resp := make([]UploadFilesResponse, len(uploadedFiles))

	for i, file := range uploadedFiles {
		item := UploadFilesResponse{}
		resp[i] = item.FromEntity(&file)
	}

	return resp
}

func (self *UploadFilesRequest) getResponse(uploadedFiles []entity.File) []UploadFilesResponse {
	return filesResponse(uploadedFiles)
}

func (self *GetFilesRequest) getResponse(uploadedFiles []entity.File) []UploadFilesResponse {
	return filesResponse(uploadedFiles)
}

func (self *UploadImageRequest) getResponse(file *entity.File) UploadFilesResponse {
	item := UploadFilesResponse{}
	return item.FromEntity(file)
}
