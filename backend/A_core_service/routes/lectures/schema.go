package lectures

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type LectureResponse struct {
	CreatedAt         time.Time                `json:"createdAt"`
	Visibility        entity.LectureVisibility `json:"visibility"`
	CourseSectionSlug string                   `json:"courseSectionSlug"`
	Position          int                      `json:"position"`
	Kind              entity.LectureKind       `json:"kind"`
	Title             string                   `json:"title"`
	Description       string                   `json:"description"`
	Data              any                      `json:"data"`
}

// type LectureResponseDataKindVideo struct {
// 	Duration             float32   `json:"duration"`
// 	ResolutionsFramerate [][]int32 `json:"resolutionsFramerate"`
// 	Poster               string    `json:"poster"`
// 	Thumbnails           string    `json:"thumbnails"`
// 	Subtitles            []string  `json:"subtitles"`
// 	NativeLanguage       string    `json:"native"`
// }
