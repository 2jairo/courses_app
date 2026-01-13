package lectures

import (
	"encoding/json"
	"fmt"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

type CreateLectureRequest struct {
	Title             string                    `json:"title" validate:"required,min=3,max=100"`
	Description       string                    `json:"description" validate:"required,max=1000"`
	Visibility        *entity.LectureVisibility `json:"visibility" validate:"enum"`
	CourseSectionSlug string                    `json:"courseSectionSlug" vlaidate:"required"`
	LectureKind       entity.LectureKind        `json:"lectureKind" validate:"required,enum"`
	LectureData       json.RawMessage           `json:"lectureData" validate:"required"`
}
type CreateLectureRequestKindVideo struct {
	FileId int64 `json:"fileId" valiate:"required"`
}
type CreateLectureRequestKindDocument struct {
	Text int64 `json:"text" valiate:"required"`
}

func (self *CreateLectureRequest) getLectureData() (any, error) {
	switch self.LectureKind {
	case entity.LectureKindVideo:
		var data CreateLectureRequestKindVideo
		err := json.Unmarshal(self.LectureData, &data)
		return data, err
	case entity.LectureKindDocument:
		var data CreateLectureRequestKindDocument
		err := json.Unmarshal(self.LectureData, &data)
		return data, err
	default:
		return nil, fmt.Errorf("unimplemented")
	}
}

func (self *CreateLectureRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(self, ctx.BodyParser)
}
