package comunication

type CServiceProcessVideoMessage struct {
	UserId   int64  `json:"user_id"`
	CourseId int64  `json:"course_id"`
	FileId   int64  `json:"file_id"`
	FileSize int64  `json:"file_size"`
	FilePath string `json:"file_path"`
}
