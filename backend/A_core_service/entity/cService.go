package entity

type CServiceProcessAnyCommonRequest struct {
	UserId           int64  `json:"user_id"`
	FileId           int64  `json:"file_id"`
	FileSize         int64  `json:"file_size"`
	FilePath         string `json:"file_path"`
	OriginalFileName string `json:"original_file_name"`
}

type CServiceProcessImageRequest struct {
	Common  CServiceProcessAnyCommonRequest `json:"common"`
	VideoId *int64                          `json:"video_id"`
}

type CServiceProcessVideoRequest struct {
	Common   CServiceProcessAnyCommonRequest `json:"common"`
	CourseId int64                           `json:"course_id"`
}

type CServiceProcessOtherRequest struct {
	Common CServiceProcessAnyCommonRequest `json:"common"`
}
