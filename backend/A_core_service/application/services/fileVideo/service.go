package filevideo

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/gofiber/fiber/v2"
)

type FileVideoService struct {
	Repo *infrastructure.AppRepositories
}

// GetVideoDetails retrieves video file details by ID
func (s *FileVideoService) GetVideoDetails(input GetVideoDetailsInput) (*GetVideoDetailsOutput, error) {
	file := &entity.File{Model: entitycommon.Model{ID: input.FileID}}
	if err := s.Repo.File.FindOne(file, entity.FilePreloadOptions{User: true}); err != nil {
		return nil, err
	}

	if file.Kind != entity.FileKindVideo {
		return nil, &localerror.LocalError{Err: localerror.ErrKindBadRequest, Status: fiber.StatusBadRequest}
	}

	return &GetVideoDetailsOutput{File: file}, nil
}
