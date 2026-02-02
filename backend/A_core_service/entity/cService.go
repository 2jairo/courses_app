package entity

type CServiceProcessImageRequest struct {
	UserId   int64  `json:"user_id"`
	FileId   int64  `json:"file_id"`
	FilePath string `json:"file_path"`
}

type CServiceProcessVideo struct {
	UserId   int64  `json:"user_id"`
	FileId   int64  `json:"file_id"`
	FilePath string `json:"file_path"`
	CourseId int64  `json:"course_id"`
	FileSize int64  `json:"file_size"`
}