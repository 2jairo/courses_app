package file

import "github.com/2jairo/courses_app/backend/A_core_service/entity"

// UploadCourseFilesOutput contains output data for UploadCourseFiles
type UploadCourseFilesOutput struct {
	Files []entity.File
}

// UploadImageOutput contains output data for UploadImage
type UploadImageOutput struct {
	File *entity.File
}

// GetCourseFilesOutput contains output data for GetCourseFiles
type GetCourseFilesOutput struct {
	Files []entity.File
}
