package lectures

import (
	"encoding/json"
	"fmt"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

type CreateLectureRequest struct {
	Body struct {
		Title           string                    `json:"title" validate:"required,min=3,max=100"`
		Description     string                    `json:"description" validate:"required,max=1000"`
		Visibility      *entity.LectureVisibility `json:"visibility" validate:"enum"`
		CourseSectionId int64                     `json:"courseSectionId" validate:"required"`
		LectureKind     entity.LectureKind        `json:"lectureKind" validate:"required,enum"`
		LectureData     json.RawMessage           `json:"lectureData" validate:"required"`
	}
}

type UpdateLectureRequest struct {
	Body   UpdateLectureRequestBody
	Params struct {
		LectureId int64
	}
}
type UpdateLectureRequestBody struct {
	Title       *string                   `json:"title" validate:"omitempty,min=3,max=100"`
	Description *string                   `json:"description" validate:"omitempty,max=1000"`
	Visibility  *entity.LectureVisibility `json:"visibility" validate:"omitempty,enum"`
	LectureKind *entity.LectureKind       `json:"lectureKind" validate:"omitempty,enum"`
	LectureData *json.RawMessage          `json:"lectureData"`
}

func (self *UpdateLectureRequestBody) HasAtLeastOneField() bool {
	return self.Title != nil || self.Description != nil || self.Visibility != nil || (self.LectureKind != nil && self.LectureData != nil)
}

type CreateLectureRequestKindVideo struct {
	FileId int64 `json:"fileId" valiate:"required"`
}
type CreateLectureRequestKindDocument struct {
	Body string `json:"body" valiate:"required"`
}

type GetLectureRequest struct {
	LectureId int64
}

type DeleteLectureRequest struct {
	LectureId int64
}

type UpdateLecturePositionRequest struct {
	Body struct {
		Position        int   `json:"position" validate:"required,min=1"`
		CourseSectionId int64 `json:"courseSectionId" validate:"required"`
	}
	Params struct {
		LectureId int64
	}
}

type MoveLectureToSectionRequest struct {
	Body struct {
		NewCourseSectionId int64 `json:"newCourseSectionId" validate:"required"`
	}
	Params struct {
		LectureId int64
	}
}

func getLectureData(lectureKind entity.LectureKind, lectureData json.RawMessage) (any, error) {
	switch lectureKind {
	case entity.LectureKindVideo:
		var data CreateLectureRequestKindVideo
		err := json.Unmarshal(lectureData, &data)
		return data, err
	case entity.LectureKindDocument:
		var data CreateLectureRequestKindDocument
		err := json.Unmarshal(lectureData, &data)
		return data, err
	default:
		return nil, fmt.Errorf("unimplemented")
	}
}

func (self *CreateLectureRequest) getLectureData() (any, error) {
	return getLectureData(self.Body.LectureKind, self.Body.LectureData)
}
func (self *UpdateLectureRequest) getLectureData() (any, error) {
	return getLectureData(*self.Body.LectureKind, *self.Body.LectureData)
}

func (self *CreateLectureRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(&self.Body, ctx.BodyParser)
}

func (self *GetLectureRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(self, ctx.ParamsParser)
}

func (self *UpdateLectureRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	if err := state.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return err
	}
	return state.DefaultBind(&self.Body, ctx.BodyParser)
}

func (self *DeleteLectureRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(self, ctx.ParamsParser)
}

func (self *UpdateLecturePositionRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	if err := state.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return err
	}
	return state.DefaultBind(&self.Body, ctx.BodyParser)
}

func (self *MoveLectureToSectionRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	if err := state.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return err
	}
	return state.DefaultBind(&self.Body, ctx.BodyParser)
}
