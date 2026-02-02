package lectureasset

import "github.com/2jairo/courses_app/backend/A_core_service/entity"

// GetLectureFilesOutput contains output data for GetLectureFiles
type GetLectureFilesOutput struct {
	Assets []entity.LectureAsset
}
