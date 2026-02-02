package filesvideo

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type VideoDetailsResponse struct {
	ID           int64                    `json:"id"`
	CreatedAt    time.Time                `json:"createdAt"`
	UpdatedAt    time.Time                `json:"updatedAt"`
	Status       entity.FileStatus        `json:"status"`
	Kind         entity.FileKind          `json:"kind"`
	OriginalName string                   `json:"originalName"`
	FileSize     int64                    `json:"fileSize"`
	Metadata     any                      `json:"metadata"`
	User         VideoDetailsResponseUser `json:"user"`
	Cdn          utils.CdnResponse        `json:"cdn"`
}
type VideoDetailsResponseUser struct {
	Username string  `json:"username"`
	ID       int64   `json:"id"`
	Avatar   *string `json:"avatar"`
}

func (self *GetVideoDetailsRequest) getResponse(file *entity.File) VideoDetailsResponse {
	return buildVideoDetailsResponse(file)
}

func buildVideoDetailsResponse(file *entity.File) VideoDetailsResponse {
	var avatar *string = nil
	if file.User.Avatar != nil {
		path := file.User.Avatar.CdnImageUrl()
		avatar = &path
	}

	return VideoDetailsResponse{
		ID:           int64(file.ID),
		CreatedAt:    file.CreatedAt,
		UpdatedAt:    file.UpdatedAt,
		Status:       file.Status,
		Kind:         file.Kind,
		OriginalName: file.OriginalName,
		FileSize:     file.FileSize,
		Metadata:     file.Metadata,
		User: VideoDetailsResponseUser{
			Username: file.User.Username,
			ID:       int64(file.User.ID),
			Avatar:   avatar,
		},
		Cdn: utils.CdnResponse{
			Base: config.CdnServiceUrl.FileBaseUrl(int64(file.ID)),
		},
	}
}
