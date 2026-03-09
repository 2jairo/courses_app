package lectures

import (
	"encoding/json"
	"time"

	courseprogress "github.com/2jairo/courses_app/backend/A_core_service/application/services/courseProgress"
	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type GetLectureResponse struct {
	Id                    int64                     `json:"id"`
	Slug                  string                    `json:"slug"`
	CreatedAt             time.Time                 `json:"createdAt"`
	Visibility            entity.LectureVisibility  `json:"visibility"`
	Position              int                       `json:"position"`
	Kind                  entity.LectureKind        `json:"kind"`
	Title                 string                    `json:"title"`
	Description           string                    `json:"description"`
	EstimatedDurationSecs int32                     `json:"estimatedDurationSecs"`
	Seen                  bool                      `json:"seen"`
	Assets                []GetLectureAssetResponse `json:"assets"`
	Data                  any                       `json:"data"`
}
type GetLectureAssetResponse struct {
	Name   string            `json:"name"`
	Size   int64             `json:"size"`
	Kind   entity.FileKind   `json:"kind"`
	FileId int64             `json:"fileId"`
	Cdn    utils.CdnResponse `json:"cdn"`
}

type LectureResponseDataKindVideo struct {
	Duration      float32                                 `json:"duration"`
	Resolutions   [][]int32                               `json:"resolutions"`
	MediaPlaylist string                                  `json:"mediaPlaylist"`
	Poster        string                                  `json:"poster"`
	Thumbnails    string                                  `json:"thumbnails"`
	Subtitles     []entity.FileMetadataKindVideoSubtitles `json:"subtitles"`
	Cdn           utils.CdnResponse                       `json:"cdn"`
}
type GetLectureResponseKindDocument struct {
	Body json.RawMessage `json:"body"`
}
type GetLectureResponseKindQuiz struct {
	TimeLimitSecs          *int32                                 `json:"timeLimitSecs"`
	PassingScorePercentage int32                                  `json:"passingScorePercentage"`
	ShowCorrectAnswers     bool                                   `json:"showCorrectAnswers"`
	CreatedAt              time.Time                              `json:"createdAt"`
	QuestionsAmount        int32                                  `json:"questionsAmount"`
	PublicQuestionsAmount  int32                                  `json:"publicQuestionsAmount"`
	ActiveAttempt          bool                                   `json:"activeAttempt"`
	LastAttempt            *GetLectureResponseKindQuizLastAttempt `json:"lastAttempt"`
}
type GetLectureResponseKindQuizLastAttempt struct {
	ExpiresAt              *time.Time `json:"expiresAt"`
	CompletedAt            *time.Time `json:"completedAt"`
	MaxPoints              float64    `json:"maxPoints"`
	PointsEarned           float64    `json:"pointsEarned"`
	PassingScorePercentage int32      `json:"passingScorePercentage"`
	Passed                 bool       `json:"passed"`
}

func getResponse(
	lecture *entity.Lecture,
	lectureData any,
	lectureExtraData any,
	progress *courseprogress.CourseProgressWrapper,
) *GetLectureResponse {
	assets := make([]GetLectureAssetResponse, len(lecture.Assets))
	for i, asset := range lecture.Assets {
		assets[i] = GetLectureAssetResponse{
			Name:   asset.File.OriginalName,
			Size:   asset.File.FileSize,
			Kind:   asset.File.Kind,
			FileId: int64(asset.File.ID),
			Cdn: utils.CdnResponse{
				Base: config.CdnServiceUrl.FileBaseUrl(int64(asset.File.ID)),
			},
		}
	}

	var dataResp any
	switch lecture.Kind {
	case entity.LectureKindVideo:
		data := lectureData.(*entity.LectureVideo)
		var metadata entity.FileMetadataKindVideo
		json.Unmarshal(data.File.Metadata, &metadata)

		dataResp = LectureResponseDataKindVideo{
			Duration:      metadata.Duration,
			Resolutions:   metadata.Resolutions,
			MediaPlaylist: metadata.MediaPlaylist,
			Poster:        metadata.Poster,
			Thumbnails:    metadata.Thumbnails,
			Subtitles:     metadata.Subtitles,
			Cdn: utils.CdnResponse{
				Base: config.CdnServiceUrl.FileBaseUrl(int64(data.FileID)),
			},
		}
	case entity.LectureKindDocument:
		data := lectureData.(*entity.LectureDocument)
		dataResp = GetLectureResponseKindDocument{
			Body: json.RawMessage(data.Body),
		}
	case entity.LectureKindQuiz:
		data := lectureData.(*entity.LectureQuiz)
		extraData := lectureExtraData.(*entity.QuizAttempt)

		var activeAttempt bool = false
		var lastAttempt *GetLectureResponseKindQuizLastAttempt = nil

		if extraData != nil {
			// activeAttempt = extraData is not expired and is not completed
			activeAttempt = (extraData.ExpiresAt == nil || extraData.ExpiresAt.After(time.Now())) && extraData.CompletedAt == nil

			lastAttempt = &GetLectureResponseKindQuizLastAttempt{
				ExpiresAt:              extraData.ExpiresAt,
				CompletedAt:            extraData.CompletedAt,
				MaxPoints:              extraData.MaxPoints,
				PointsEarned:           extraData.PointsEarned,
				PassingScorePercentage: extraData.PassingScorePercentage,
				Passed:                 extraData.Passed,
			}
		}

		dataResp = GetLectureResponseKindQuiz{
			TimeLimitSecs:          data.TimeLimitSecs,
			PassingScorePercentage: data.PassingScorePercentage,
			ShowCorrectAnswers:     data.ShowCorrectAnswers,
			CreatedAt:              data.CreatedAt,
			QuestionsAmount:        data.QuestionsAmount,
			PublicQuestionsAmount:  data.PublicQuestionsAmount,
			ActiveAttempt:          activeAttempt,
			LastAttempt:            lastAttempt,
		}

	case entity.LectureKindLab:
		panic("not implemented")
	}

	return &GetLectureResponse{
		Id:                    int64(lecture.ID),
		Slug:                  lecture.Slug.Slug,
		CreatedAt:             lecture.CreatedAt,
		Visibility:            lecture.Visibility,
		Position:              lecture.Position,
		Kind:                  lecture.Kind,
		Title:                 lecture.Title,
		Description:           lecture.Description,
		EstimatedDurationSecs: lecture.EstimatedDurationSecs,
		Seen:                  progress.IsLectureSeen(lecture.ID),
		Assets:                assets,
		Data:                  dataResp,
	}
}

func (self *GetLectureRequest) getResponse(
	lecture *entity.Lecture,
	lectureData any,
	lectureExtraData any,
	progress *courseprogress.CourseProgressWrapper,
) *GetLectureResponse {
	return getResponse(lecture, lectureData, lectureExtraData, progress)
}
