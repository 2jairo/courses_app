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
	DataId                int64                    `json:"dataId"`
	EstimatedDurationSecs int32                    `json:"estimatedDurationSecs"`
	Data                  any                      `json:"data"`
}
type LectureResponseDataKindVideo struct {
	FileId        int64                                   `json:"fileId"`
	Duration      float32                                 `json:"duration"`
	Resolutions   [][]int32                               `json:"resolutions"`
	MediaPlaylist string                                  `json:"mediaPlaylist"`
	Poster        string                                  `json:"poster"`
	Thumbnails    string                                  `json:"thumbnails"`
	Subtitles     []entity.FileMetadataKindVideoSubtitles `json:"subtitles"`
}

type LectureResponseDataKindDocument struct {
	Body json.RawMessage `json:"body"`
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
		var metadata entity.FileMetadataKindVideo
		json.Unmarshal(data.File.Metadata, &metadata)

		dataResponse = LectureResponseDataKindVideo{
			Duration:      metadata.Duration,
			Resolutions:   metadata.Resolutions,
			MediaPlaylist: metadata.MediaPlaylist,
			Poster:        metadata.Poster,
			Thumbnails:    metadata.Thumbnails,
			Subtitles:     metadata.Subtitles,
			FileId:        int64(data.FileID),
		}
	case entity.LectureKindDocument:
		data := lectureData.(*entity.LectureDocument)
		dataResponse = &LectureResponseDataKindDocument{
			Body: json.RawMessage(data.Body),
		}
	case entity.LectureKindLab:
		panic("unimplemented")
	case entity.LectureKindQuiz:
		panic("unimplemented")
	}

	return &LectureResponse{
		ID:                    int64(lecture.ID),
		Slug:                  lecture.Slug.Slug,
		Title:                 lecture.Title,
		Description:           lecture.Description,
		Visibility:            lecture.Visibility,
		CourseSectionId:       int64(courseSection.ID),
		Kind:                  lecture.Kind,
		CreatedAt:             lecture.CreatedAt,
		Position:              lecture.Position,
		DataId:                int64(lecture.Data),
		EstimatedDurationSecs: lecture.EstimatedDurationSecs,
		Data:                  dataResponse,
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
