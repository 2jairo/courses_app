package lectures

import (
	"encoding/json"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type LectureResponse struct {
	Slug              string                   `json:"slug"`
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

func (self *CreateLectureRequest) getResponse(
	lecture *entity.Lecture,
	lectureData any,
	courseSection *entity.CourseSection,
) *LectureResponse {
	var dataResponse any

	switch lecture.Kind {
	case entity.LectureKindVideo:
		data := lectureData.(*entity.LectureVideo)
		json.Unmarshal(data.File.Metadata, &dataResponse)
	default:
		panic("unimplemented")
	}

	return &LectureResponse{
		Slug:              lecture.Slug.Slug,
		Title:             lecture.Title,
		Description:       lecture.Description,
		Visibility:        lecture.Visibility,
		CourseSectionSlug: courseSection.Slug.Slug,
		Kind:              lecture.Kind,
		CreatedAt:         lecture.CreatedAt,
		Position:          lecture.Position,
		Data:              dataResponse,
	}
}
