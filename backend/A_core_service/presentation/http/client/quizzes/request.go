package quizzes

import (
	"encoding/json"

	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type StartQuizAttemptRequest struct {
	Params struct {
		LectureSlug string
	}
}

func (self *StartQuizAttemptRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	return utils.DefaultBind(&self.Params, ctx.ParamsParser)
}

type SetAnswerRequest struct {
	Params struct {
		LectureSlug string
		QuestionId  int64
	}
	Body struct {
		Answer json.RawMessage `json:"answer"`
	}
}

func (self *SetAnswerRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return global.Err(err)
	}
	return u.DefaultBind(&self.Body, ctx.BodyParser)
}

type FinishAttemptRequest struct {
	Params struct {
		LectureSlug string
	}
}

func (self *FinishAttemptRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(&self.Params, ctx.ParamsParser)
}

type GetLastQuizAttemptResultRequest struct {
	Params struct {
		LectureSlug string
	}
}

func (self *GetLastQuizAttemptResultRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(&self.Params, ctx.ParamsParser)
}

type GetQuizAttemptDetailsRequest struct {
	Params struct {
		AttemptId int64
	}
}

func (self *GetQuizAttemptDetailsRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(&self.Params, ctx.ParamsParser)
}
