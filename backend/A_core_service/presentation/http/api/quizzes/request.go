package quizzes

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type CreateQuizRequest struct {
	Body struct {
		TimeLimitSecs          *int32 `json:"timeLimitSecs" validate:"omitempty,min=0"`
		PassingScorePercentage *int32 `json:"passingScorePercentage" validate:"omitempty,min=0,max=100"`
		ShuffleQuestions       *bool  `json:"shuffleQuestions"`
		ShowCorrectAnswers     *bool  `json:"showCorrectAnswers"`
		Title                  string `json:"title" validate:"min=3,max=100"`
	}
	Params struct {
		CourseId int64
	}
}

type DeleteQuizRequest struct {
	QuizId int64
}

type GetQuizzesRequest struct {
	Query struct {
		utils.Pagination
		QueryByTitle string             `query:"q" json:"q" validate:"omitempty,min=3"`
		SortOrder    *utils.SortOrder   `query:"sortOrder" json:"sortOrder" validate:"omitempty,enum"`
		SortBy       *entity.QuizSortBy `query:"sortBy" json:"sortBy" validate:"omitempty,enum"`
	}
	Params struct {
		CourseId int64
	}
}

type GetQuizDetailsRequest struct {
	QuizId int64
}

type UpdateQuizRequest struct {
	QuizId int64
	Body   struct {
		Title                  *string `json:"title" validate:"omitempty,min=3,max=100"`
		TimeLimitSecs          *int32  `json:"timeLimitSecs" validate:"omitempty,min=0"`
		PassingScorePercentage *int32  `json:"passingScorePercentage" validate:"omitempty,min=0,max=100"`
		ShuffleQuestions       *bool   `json:"shuffleQuestions"`
		ShowCorrectAnswers     *bool   `json:"showCorrectAnswers"`
	}
}

func (self *CreateQuizRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return global.Err(err)
	}
	return u.DefaultBind(&self.Body, ctx.BodyParser)
}

func (self *DeleteQuizRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(self, ctx.ParamsParser)
}

func (self *GetQuizzesRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return global.Err(err)
	}
	return u.DefaultBind(&self.Query, ctx.QueryParser)
}

func (self *GetQuizDetailsRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(self, ctx.ParamsParser)
}

func (self *UpdateQuizRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(self, ctx.ParamsParser); err != nil {
		return global.Err(err)
	}
	return u.DefaultBind(&self.Body, ctx.BodyParser)
}
