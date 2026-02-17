package file

import (
	"io"
	"mime/multipart"
	"os"
	"path"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type FileService struct {
	Repo *infrastructure.AppRepositories
}

// UploadCourseFiles uploads multiple files for a course
func (self *FileService) UploadCourseFiles(input UploadCourseFilesInput) (*UploadCourseFilesOutput, error) {
	course := &entity.Course{Model: entitycommon.Model{ID: input.CourseID}}
	if err := self.Repo.Course.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
		return nil, err
	}

	uploadedFiles := []entity.File{}

	for {
		part, err := input.Multipart.NextPart()
		if err != nil {
			if err == io.EOF {
				break
			}
			return nil, &localerror.LocalError{Err: localerror.ErrKindTooLarge, Status: fiber.StatusRequestEntityTooLarge}
		}

		fileEntity := entity.File{}
		if err := self.handlePart(
			part,
			nil,
			&fileEntity,
			course,
			input.UserID,
			false,
		); err != nil {
			return nil, err
		}
		uploadedFiles = append(uploadedFiles, fileEntity)
	}

	return &UploadCourseFilesOutput{Files: uploadedFiles}, nil
}

// UploadImage uploads a single image for a course
func (self *FileService) UploadImage(input UploadImageInput) (*UploadImageOutput, error) {
	course := &entity.Course{Model: entitycommon.Model{ID: input.CourseID}}
	if err := self.Repo.Course.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
		return nil, err
	}

	part, err := input.Multipart.NextPart()
	if err != nil {
		if err == io.EOF {
			return nil, &localerror.LocalError{Err: localerror.ErrKindBadRequest, Status: fiber.StatusBadRequest}
		}
		return nil, &localerror.LocalError{Err: localerror.ErrKindTooLarge, Status: fiber.StatusRequestEntityTooLarge}
	}

	fileEntity := entity.File{}
	onlyImages := entity.FileKindImage
	if err := self.handlePart(
		part,
		&onlyImages,
		&fileEntity,
		course,
		input.UserID,
		true,
	); err != nil {
		return nil, err
	}

	return &UploadImageOutput{File: &fileEntity}, nil
}

// GetCourseFiles retrieves files for a course with filtering options
func (self *FileService) GetCourseFiles(input GetCourseFilesInput) (*GetCourseFilesOutput, error) {
	users, err := self.Repo.User.FindIn(input.UserNames)
	if err != nil {
		return nil, err
	}
	if len(input.UserNames) > len(users) {
		return nil, &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}

	usersId := make([]entitycommon.Id, len(users))
	for i, user := range users {
		usersId[i] = user.ID
	}

	q := ""
	if len(input.QueryByTitle) >= 3 {
		q = input.QueryByTitle
	}

	files, err := self.Repo.File.Find(
		&entity.File{CourseID: input.CourseID},
		entity.FilePreloadOptions{User: true},
		input.Kind,
		input.Status,
		usersId,
		q,
		input.SortOrder,
		input.SortBy,
		&input.Pagination,
	)
	if err != nil {
		return nil, err
	}

	return &GetCourseFilesOutput{Files: files}, nil
}

// handlePart processes a multipart file part and creates a file entity
func (self *FileService) handlePart(
	part *multipart.Part,
	onlyFileKind *entity.FileKind,
	fileEntity *entity.File,
	course *entity.Course,
	userID entitycommon.Id,
	wait bool,
) error {
	fileKind := entity.FileKind(part.FormName())
	if onlyFileKind != nil && fileKind != *onlyFileKind {
		return &localerror.LocalError{Err: localerror.ErrKindForbidden, Status: fiber.StatusForbidden}
	}
	if !fileKind.IsValid() {
		fileKind = entity.FileKindOther
	}

	rawFileName := utils.GenerateUUID()
	rawFilePath := path.Join(config.RawFilesBasePath, rawFileName)

	file, err := os.Create(rawFilePath)
	if err != nil {
		return err
	}

	fileSize, err := io.Copy(file, part)
	if err != nil {
		return err
	}
	if err := file.Close(); err != nil {
		return err
	}

	*fileEntity = entity.File{
		UserID:       userID,
		CourseID:     course.ID,
		Kind:         fileKind,
		Status:       entity.FileStatusPending,
		OriginalName: part.FileName(),
		FileSize:     fileSize,
		RawFileName:  rawFileName,
	}

	if err := self.Repo.File.Create(fileEntity, entity.FilePreloadOptions{User: true}); err != nil {
		os.Remove(rawFilePath)
		return err
	}

	if wait {
		var msgHandler func(rawMsg []byte, metadataValues map[string]any) (entity.FileStatus, error)
		switch fileKind {
		case entity.FileKindImage:
			msgHandler = self.UpdateFileImageMetadata
		case entity.FileKindVideo:
			msgHandler = self.UpdateFileVideoMetadata
		case entity.FileKindOther:
			msgHandler = self.UpdateFileOtherMetadata
		}

		if err := self.Repo.File.WaitUntilCServiceResponse(fileEntity, msgHandler); err != nil {
			return err
		}
	} else {
		if err := self.Repo.File.NotifyCService(fileEntity); err != nil {
			return err
		}
	}
	return nil
}

func (self *FileService) UpdateFileImageMetadata(rawMsg []byte, metadataValues map[string]any) (entity.FileStatus, error) {
	data := &CServiceProcessImageInput{}
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

func (self *FileService) UpdateFileVideoMetadata(rawMsg []byte, metadataValues map[string]any) (entity.FileStatus, error) {
	data := &CServiceProcessVideoInput{}
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

func (self *FileService) UpdateFileOtherMetadata(rawMsg []byte, metadataValues map[string]any) (entity.FileStatus, error) {
	data := &CServiceProcessOtherInput{}
	if err := data.UnmarshalJSON(rawMsg); err != nil {
		return entity.FileStatusProcessing, err
	}

	newFileStatus := entity.FileStatusProcessing

	switch data.Variant {
	case CServiceProcessOtherVariantEnumOk:
		body := data.Body.(CServiceProcessOtherVariantOk)
		metadataValues["path"] = body.Path
		newFileStatus = entity.FileStatusReady

	case CServiceProcessOtherVariantEnumError:
		body := data.Body.(CServiceProcessOtherVariantError)
		metadataValues["error"] = body.Error
		newFileStatus = entity.FileStatusFailed
	}

	return newFileStatus, nil
}
