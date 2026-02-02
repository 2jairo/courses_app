package file

import (
	"mime/multipart"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

// UploadCourseFilesInput contains input parameters for UploadCourseFiles
type UploadCourseFilesInput struct {
	CourseID  entitycommon.Id
	UserID    entitycommon.Id
	Multipart *multipart.Reader
}

// UploadImageInput contains input parameters for UploadImage
type UploadImageInput struct {
	CourseID  entitycommon.Id
	UserID    entitycommon.Id
	Multipart *multipart.Reader
}

// GetCourseFilesInput contains input parameters for GetCourseFiles
type GetCourseFilesInput struct {
	CourseID     entitycommon.Id
	Kind         entity.FileKindList
	Status       entity.FileStatusList
	QueryByTitle string
	SortOrder    *utils.SortOrder
	SortBy       *entity.FileSortBy
	Pagination   utils.Pagination
	UserNames    []string
}
