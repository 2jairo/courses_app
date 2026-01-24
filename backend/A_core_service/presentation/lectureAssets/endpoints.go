package lectureassets

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

type LectureAssetsEndpoints struct {
	State *state.AppState
}

func (self *LectureAssetsEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.State.AuthMiddleware.ClientAuth())
	canWrite := self.State.CourseRoleMiddleware.HasRole(entity.CoursePermissionsRoleWrite)
	canRead := self.State.CourseRoleMiddleware.HasRole(entity.CoursePermissionsRoleRead)

	r.Post("/:lectureId/files", canWrite, self.SetFilesToLecture)
	r.Get("/:lectureId/files", canRead, self.GetLectureFiles)
}

func (self *LectureAssetsEndpoints) SetFilesToLecture(ctx *fiber.Ctx) error {
	c := &AddFilesToLectureRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	lectureID := c.Path.LectureId

	// Verify lecture exists and load course info
	lecture := &entity.Lecture{Model: entitycommon.Model{ID: lectureID}}
	if err := self.State.LectureRepository.FindOne(
		lecture,
		entity.LecturePreloadOptions{CourseSection: true},
	); err != nil {
		return err
	}

	// Verify all files exist
	files, err := self.State.FileRepository.FindIn(c.Body.FileIds, entity.FilePreloadOptions{})
	if err != nil {
		return err
	}

	// Validate file ownership
	for _, file := range files {
		if file.CourseID != lecture.CourseSection.CourseID {
			return &localerror.LocalError{Err: localerror.ErrKindBadRequest, Status: fiber.StatusBadRequest}
		}
	}

	// Fetch existing lecture assets using repository
	existingAssets, err := self.State.LectureAssetRepository.Find(
		&entity.LectureAsset{LectureID: lectureID},
		entity.LectureAssetPreloadOptions{},
	)
	if err != nil {
		return err
	}

	// GET assets to create
	existingFileIds := make(map[int64]struct{}, len(existingAssets))
	newLectureAssets := []entity.LectureAsset{}

	for _, asset := range existingAssets {
		for _, requestedFileId := range c.Body.FileIds {
			if asset.FileID == requestedFileId {
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

	// GET assets to delete
	requestedFileIds := make(map[int64]struct{}, len(c.Body.FileIds))
	deletedLectureAssets := []entity.LectureAsset{}
	for _, fileId := range c.Body.FileIds {
		requestedFileIds[fileId] = struct{}{}
	}
	for _, asset := range existingAssets {
		if _, exists := requestedFileIds[asset.FileID]; !exists {
			deletedLectureAssets = append(deletedLectureAssets, asset)
		}
	}

	// perform db query
	if len(deletedLectureAssets) > 0 {
		if err := self.State.LectureAssetRepository.Delete(deletedLectureAssets); err != nil {
			return err
		}
	}
	if len(newLectureAssets) > 0 {
		if err := self.State.LectureAssetRepository.CreateMany(newLectureAssets); err != nil {
			return err
		}
	}

	ctx.Status(fiber.StatusOK) //.JSON(c.getResponse(lecture))
	return nil
}

func (self *LectureAssetsEndpoints) GetLectureFiles(ctx *fiber.Ctx) error {
	c := &GetLectureFilesRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	lecture := &entity.Lecture{Model: entitycommon.Model{ID: c.Path.LectureId}}
	if err := self.State.LectureRepository.FindOne(
		lecture,
		entity.LecturePreloadOptions{
			Assets: true,
		},
	); err != nil {
		return err
	}

	fileIds := make([]int64, len(lecture.Assets))
	for i, asset := range lecture.Assets {
		fileIds[i] = asset.FileID
	}

	files, err := self.State.FileRepository.FindIn(
		fileIds,
		entity.FilePreloadOptions{User: true},
	)
	if err != nil {
		return err
	}

	fileMap := make(map[int64]entity.File, len(files))
	for _, file := range files {
		fileMap[file.ID] = file
	}

	for i := range lecture.Assets {
		if file, exists := fileMap[lecture.Assets[i].FileID]; exists {
			lecture.Assets[i].File = file
		}
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(lecture.Assets))
}
