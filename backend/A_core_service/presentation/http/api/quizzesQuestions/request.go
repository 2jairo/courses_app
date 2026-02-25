package quizzesquestions

import (
	"encoding/json"
	"fmt"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
	"gorm.io/datatypes"
)

type CreateQuestionRequest struct {
	Body struct {
		Kind         entity.QuizQuestionKind   `json:"kind" validate:"required,enum"`
		Status       entity.QuizQuestionStatus `json:"status" validate:"required,enum"`
		QuestionText string                    `json:"questionText" validate:"required,min=1,max=1000"`
		Options      json.RawMessage           `json:"options" validate:"required"`
		Explanation  *string                   `json:"explanation" validate:"omitempty,max=2000"`
		Points       int32                     `json:"points" validate:"required,min=1"`
	}
	Params struct {
		QuizId int64
	}
}

type UpdateQuestionRequest struct {
	Body   UpdateQuestionRequestBody
	Params struct {
		QuestionId int64
	}
}

type UpdateQuestionRequestBody struct {
	Kind         *entity.QuizQuestionKind   `json:"kind" validate:"omitempty,enum"`
	Status       *entity.QuizQuestionStatus `json:"status" validate:"omitempty,enum"`
	QuestionText *string                    `json:"questionText" validate:"omitempty,min=1,max=1000"`
	Options      *json.RawMessage           `json:"options"`
	Explanation  *string                    `json:"explanation" validate:"omitempty,max=2000"`
	Points       *int32                     `json:"points" validate:"omitempty,min=1"`
}

func (self *UpdateQuestionRequestBody) HasAtLeastOneField() bool {
	return self.Status != nil || self.QuestionText != nil || self.Explanation != nil || self.Points != nil || (self.Kind != nil && self.Options != nil)
}

type CreateQuestionRequestKindBoolMultiple struct {
	Choices []struct {
		Id      string `json:"id"`
		Text    string `json:"text" validate:"required,min=1,max=500"`
		Correct bool   `json:"correct"`
	} `json:"choices" validate:"required,min=1"`
}

type CreateQuestionRequestKindBoolSingle struct {
	Choices []struct {
		Id      string `json:"id"`
		Text    string `json:"text" validate:"required,min=1,max=500"`
		Correct bool   `json:"correct"`
	} `json:"choices" validate:"required,min=2"`
}

type CreateQuestionRequestKindTextMultiple struct {
	Keywords []struct {
		Id    string `json:"id"`
		Value string `json:"value" validate:"min=1,max=500"`
	} `json:"keywords" validate:"required,min=1"`
}

type CreateQuestionRequestKindTextSingle struct {
	CorrectAnswer string `json:"correctAnswer" validate:"required,min=1,max=500"`
}

type CreateQuestionRequestKindMatch struct {
	Pairs []struct {
		Key     string `json:"key" validate:"required,min=1,max=500"`
		KeyId   string `json:"keyId"`
		Value   string `json:"value" validate:"required,min=1,max=500"`
		ValueId string `json:"valueId"`
	} `json:"pairs" validate:"required,min=1"`
}

type CreateQuestionRequestKindOrdering struct {
	Items []struct {
		Id    string `json:"id"`
		Value string `json:"value" validate:"min=1,max=500"`
	} `json:"items"`
}

type DeleteQuestionRequest struct {
	QuestionId int64
}

type UpdateQuestionPositionRequest struct {
	Body struct {
		Position int32 `json:"position" validate:"required,min=1"`
		QuizId   int64 `json:"quizId" validate:"required"`
	}
	Params struct {
		QuestionId int64
	}
}

func getQuestionOptions(questionKind entity.QuizQuestionKind, questionData json.RawMessage) (datatypes.JSON, any, error) {
	switch questionKind {
	case entity.QuizQuestionKindBoolMultiple:
		var data CreateQuestionRequestKindBoolMultiple
		if err := json.Unmarshal(questionData, &data); err != nil {
			return nil, nil, err
		}
		// Validate at least one choice is correct
		hasCorrect := false
		for _, choice := range data.Choices {
			if choice.Correct {
				hasCorrect = true
				break
			}
		}
		if !hasCorrect {
			return nil, nil, &localerror.LocalError{Err: localerror.ErrKindAtLeastOneCorrect, Status: fiber.StatusBadRequest}
		}
		for i := range data.Choices {
			data.Choices[i].Id = utils.GenerateUUID()
		}
		marshaled, err := json.Marshal(data)
		if err != nil {
			return nil, nil, err
		}
		return datatypes.JSON(marshaled), data, nil

	case entity.QuizQuestionKindBoolSingle:
		var data CreateQuestionRequestKindBoolSingle
		if err := json.Unmarshal(questionData, &data); err != nil {
			return nil, nil, err
		}
		// Validate exactly one choice is correct
		correctCount := 0
		for _, choice := range data.Choices {
			if choice.Correct {
				correctCount++
			}
		}
		if correctCount != 1 {
			return nil, nil, &localerror.LocalError{Err: localerror.ErrKindOnlyOneCorrect, Status: fiber.StatusBadRequest}
		}
		for i := range data.Choices {
			data.Choices[i].Id = utils.GenerateUUID()
		}
		marshaled, err := json.Marshal(data)
		if err != nil {
			return nil, nil, err
		}
		return datatypes.JSON(marshaled), data, nil

	case entity.QuizQuestionKindTextMultiple:
		var data CreateQuestionRequestKindTextMultiple
		if err := json.Unmarshal(questionData, &data); err != nil {
			return nil, nil, err
		}
		if len(data.Keywords) == 0 {
			return nil, nil, &localerror.LocalError{Err: localerror.ErrKindAtLeastOneKeyword, Status: fiber.StatusBadRequest}
		}
		for i := range data.Keywords {
			data.Keywords[i].Id = utils.GenerateUUID()
		}
		marshaled, err := json.Marshal(data)
		if err != nil {
			return nil, nil, err
		}
		return datatypes.JSON(marshaled), data, nil

	case entity.QuizQuestionKindTextSingle:
		var data CreateQuestionRequestKindTextSingle
		if err := json.Unmarshal(questionData, &data); err != nil {
			return nil, nil, err
		}
		return datatypes.JSON(questionData), data, nil

	case entity.QuizQuestionKindMatch:
		var data CreateQuestionRequestKindMatch
		if err := json.Unmarshal(questionData, &data); err != nil {
			return nil, nil, err
		}
		for i := range data.Pairs {
			data.Pairs[i].KeyId = utils.GenerateUUID()
			data.Pairs[i].ValueId = utils.GenerateUUID()
		}
		marshaled, err := json.Marshal(data)
		if err != nil {
			return nil, nil, err
		}
		return datatypes.JSON(marshaled), data, nil

	case entity.QuizQuestionKindOrdering:
		var data CreateQuestionRequestKindOrdering
		if err := json.Unmarshal(questionData, &data); err != nil {
			return nil, nil, err
		}
		if len(data.Items) < 2 {
			return nil, nil, &localerror.LocalError{Err: localerror.ErrKindAtLeastTwoItems, Status: fiber.StatusBadRequest}
		}
		for i := range data.Items {
			data.Items[i].Id = utils.GenerateUUID()
		}
		marshaled, err := json.Marshal(data)
		if err != nil {
			return nil, nil, err
		}
		return datatypes.JSON(marshaled), data, nil

	default:
		return nil, nil, fmt.Errorf("invalid question kind")
	}
}

func (self *CreateQuestionRequest) getOptions() (datatypes.JSON, any, error) {
	return getQuestionOptions(self.Body.Kind, self.Body.Options)
}

func (self *UpdateQuestionRequest) getOptions() (datatypes.JSON, any, error) {
	return getQuestionOptions(*self.Body.Kind, *self.Body.Options)
}

func (self *CreateQuestionRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return err
	}
	return u.DefaultBind(&self.Body, ctx.BodyParser)
}

func (self *UpdateQuestionRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return err
	}
	return u.DefaultBind(&self.Body, ctx.BodyParser)
}

func (self *DeleteQuestionRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(self, ctx.ParamsParser)
}

func (self *UpdateQuestionPositionRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return err
	}
	return u.DefaultBind(&self.Body, ctx.BodyParser)
}
