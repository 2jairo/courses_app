package files

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
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
}
type UploadFilesResponseUser struct {
	Username string  `json:"username"`
	ID       int64   `json:"id"`
	Avatar   *string `json:"avatar"`
}

func filesResponse(uploadedFiles []entity.File) []UploadFilesResponse {
	resp := make([]UploadFilesResponse, len(uploadedFiles))

	for i, file := range uploadedFiles {
		resp[i] = UploadFilesResponse{
			ID:           file.ID,
			CreatedAt:    file.CreatedAt,
			Status:       file.Status,
			Kind:         file.Kind,
			OriginalName: file.OriginalName,
			FileSize:     file.FileSize,
			Metadata:     file.Metadata,
			User: UploadFilesResponseUser{
				Username: file.User.Username,
				ID:       file.User.ID,
				Avatar:   file.User.Avatar,
			},
		}
	}

	return resp
}

func (self *UploadFilesRequest) getResponse(uploadedFiles []entity.File) []UploadFilesResponse {
	return filesResponse(uploadedFiles)
}

func (self *GetFilesRequest) getResponse(uploadedFiles []entity.File) []UploadFilesResponse {
	return filesResponse(uploadedFiles)
}
