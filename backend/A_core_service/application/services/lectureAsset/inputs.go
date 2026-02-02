package lectureasset

import entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"

// SetFilesToLectureInput contains input parameters for SetFilesToLecture
type SetFilesToLectureInput struct {
	LectureID entitycommon.Id
	FileIds   []entitycommon.Id
}

// GetLectureFilesInput contains input parameters for GetLectureFiles
type GetLectureFilesInput struct {
	LectureID entitycommon.Id
}
