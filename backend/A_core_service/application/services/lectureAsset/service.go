package lectureasset

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/gofiber/fiber/v2"
)

type LectureAssetService struct {
	Repo *infrastructure.AppRepositories
}

// GetLectureCourseId returns the CourseId for a given LectureId for permission checking
func (s *LectureAssetService) GetLectureCourseId(lectureId entitycommon.Id) (entitycommon.Id, error) {
	lecture := &entity.Lecture{Model: entitycommon.Model{ID: lectureId}}
	if err := s.Repo.Lecture.FindOne(lecture, entity.LecturePreloadOptions{CourseSection: true}); err != nil {
		return 0, err
	}
	return lecture.CourseSection.CourseID, nil
}

// SetFilesToLecture sets files to a lecture, creating and deleting associations as needed
func (s *LectureAssetService) SetFilesToLecture(input SetFilesToLectureInput) error {
	lectureID := input.LectureID

	// Verify lecture exists and load course info
	lecture := &entity.Lecture{Model: entitycommon.Model{ID: lectureID}}
	if err := s.Repo.Lecture.FindOne(lecture, entity.LecturePreloadOptions{CourseSection: true}); err != nil {
		return err
	}

	// Verify all files exist
	files, err := s.Repo.File.FindIn(
		input.FileIds,
		&entity.File{Status: entity.FileStatusReady},
		entity.FilePreloadOptions{},
	)
	if err != nil {
		return err
	}

	// Validate file ownership
	for _, file := range files {
		if file.CourseID != lecture.CourseSection.CourseID || file.Kind != entity.FileKindOther {
			return &localerror.LocalError{Err: localerror.ErrKindBadRequest, Status: fiber.StatusBadRequest}
		}
	}

	// Fetch existing lecture assets
	existingAssets, err := s.Repo.LectureAsset.Find(
		&entity.LectureAsset{LectureID: lectureID},
		entity.LectureAssetPreloadOptions{},
	)
	if err != nil {
		return err
	}

	// Get assets to create
	existingFileIds := make(map[entitycommon.Id]struct{}, len(existingAssets))
	newLectureAssets := []entity.LectureAsset{}

	for _, asset := range existingAssets {
		for _, requestedFileId := range input.FileIds {
			if asset.FileID == entitycommon.Id(requestedFileId) {
				existingFileIds[asset.FileID] = struct{}{}
				break
			}
		}
	}
	for _, file := range files {
		if _, exists := existingFileIds[file.ID]; !exists {
			newLectureAssets = append(newLectureAssets, entity.LectureAsset{
				LectureID: lectureID,
				FileID:    file.ID,
			})
		}
	}

	// Get assets to delete
	requestedFileIds := make(map[entitycommon.Id]struct{}, len(input.FileIds))
	deletedLectureAssets := []entity.LectureAsset{}
	for _, fileId := range input.FileIds {
		requestedFileIds[fileId] = struct{}{}
	}
	for _, asset := range existingAssets {
		if _, exists := requestedFileIds[asset.FileID]; !exists {
			deletedLectureAssets = append(deletedLectureAssets, asset)
		}
	}

	// Perform db queries
	if len(deletedLectureAssets) > 0 {
		if err := s.Repo.LectureAsset.Delete(deletedLectureAssets); err != nil {
			return err
		}
	}
	if len(newLectureAssets) > 0 {
		if err := s.Repo.LectureAsset.CreateMany(newLectureAssets); err != nil {
			return err
		}
	}

	return nil
}

// GetLectureFiles retrieves all files associated with a lecture
func (s *LectureAssetService) GetLectureFiles(input GetLectureFilesInput) (*GetLectureFilesOutput, error) {
	lecture := &entity.Lecture{Model: entitycommon.Model{ID: input.LectureID}}
	if err := s.Repo.Lecture.FindOne(lecture, entity.LecturePreloadOptions{Assets: true}); err != nil {
		return nil, err
	}

	fileIds := make([]entitycommon.Id, len(lecture.Assets))
	for i, asset := range lecture.Assets {
		fileIds[i] = asset.FileID
	}

	files, err := s.Repo.File.FindIn(
		fileIds,
		&entity.File{Status: entity.FileStatusReady},
		entity.FilePreloadOptions{User: true},
	)
	if err != nil {
		return nil, err
	}

	fileMap := make(map[entitycommon.Id]entity.File, len(files))
	for _, file := range files {
		fileMap[file.ID] = file
	}

	for i := range lecture.Assets {
		if file, exists := fileMap[lecture.Assets[i].FileID]; exists {
			lecture.Assets[i].File = &file
		}
	}

	return &GetLectureFilesOutput{
		Assets: lecture.Assets,
	}, nil
}
