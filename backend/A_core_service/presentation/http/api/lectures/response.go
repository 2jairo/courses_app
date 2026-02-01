package lectures

import (
	"encoding/json"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type LectureResponse struct {
	ID                    int64                    `json:"id"`
	Slug                  string                   `json:"slug"`
	CreatedAt             time.Time                `json:"createdAt"`
	Visibility            entity.LectureVisibility `json:"visibility"`
	CourseSectionId       int64                    `json:"courseSectionId"`
	Position              int                      `json:"position"`
	Kind                  entity.LectureKind       `json:"kind"`
	Title                 string                   `json:"title"`
	Description           string                   `json:"description"`
	Data                  any                      `json:"data"`
	DataId                int64                    `json:"dataId"`
	EstimatedDurationSecs int32                    `json:"estimatedDurationSecs"`
}

// type LectureResponseDataKindVideo struct {
// 	Duration             float32   `json:"duration"`
// 	ResolutionsFramerate [][]int32 `json:"resolutionsFramerate"`
//  MediaPlaylist string `json:"mediaPlaylist"`
// 	Poster               string    `json:"poster"`
// 	Thumbnails           string    `json:"thumbnails"`
// 	Subtitles            []messages.CServiceProcessVideoVariantSpeechToTextLanguages  `json:"subtitles"`
// }

type LectureResponseDataKindDocument struct {
	Body string `json:"body"`
}

func getLectureWithData(
	lecture *entity.Lecture,
	lectureData any,
	courseSection *entity.CourseSection,
) *LectureResponse {
	var dataResponse any

	// switchLectureKind
	switch lecture.Kind {
	case entity.LectureKindVideo:
		data := lectureData.(*entity.LectureVideo)
		json.Unmarshal(data.File.Metadata, &dataResponse)
	case entity.LectureKindDocument:
		data := lectureData.(*entity.LectureDocument)
		dataResponse = &LectureResponseDataKindDocument{
			Body: data.Body,
		}
	case entity.LectureKindLab:
		panic("unimplemented")
	case entity.LectureKindQuiz:
		panic("unimplemented")
	}

	return &LectureResponse{
		ID:                    lecture.ID,
		Slug:                  lecture.Slug.Slug,
		Title:                 lecture.Title,
		Description:           lecture.Description,
		Visibility:            lecture.Visibility,
		CourseSectionId:       courseSection.ID,
		Kind:                  lecture.Kind,
		CreatedAt:             lecture.CreatedAt,
		Position:              lecture.Position,
		DataId:                lecture.Data,
		Data:                  dataResponse,
		EstimatedDurationSecs: lecture.EstimatedDurationSecs,
	}
}

func (self *CreateLectureRequest) getResponse(lecture *entity.Lecture, lectureData any, courseSection *entity.CourseSection) *LectureResponse {
	return getLectureWithData(lecture, lectureData, courseSection)
}

func (self *GetLectureRequest) getResponse(lecture *entity.Lecture, lectureData any, courseSection *entity.CourseSection) *LectureResponse {
	return getLectureWithData(lecture, lectureData, courseSection)
}

func (self *UpdateLectureRequest) getResponse(lecture *entity.Lecture, lectureData any, courseSection *entity.CourseSection) *LectureResponse {
	return getLectureWithData(lecture, lectureData, courseSection)
}
