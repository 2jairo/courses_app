package quizzes

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	lecturequiz "github.com/2jairo/courses_app/backend/A_core_service/application/services/lectureQuiz"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type QuizzesEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *QuizzesEndpoints) RegisterRoutes(r fiber.Router) {
	auth := self.Services.Middleware.ClientAuth()

	r.Get("/attempt/:attemptId", auth, self.GetQuizAttemptDetails)
	r.Post("/attempt/:lectureSlug", auth, self.StartQuizAttempt)
	r.Post("/attempt/:lectureSlug/answer/:questionId", auth, self.SetAnswer)
	r.Post("/attempt/:lectureSlug/finish", auth, self.FinishAttempt)
}

func (self *QuizzesEndpoints) GetQuizAttemptDetails(ctx *fiber.Ctx) error {
	c := &GetQuizAttemptDetailsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	output, err := self.Services.LectureQuiz.GetAttemptDetails(
		lecturequiz.GetAttemptDetailsInput{
			AttemptID: entitycommon.Id(c.Params.AttemptId),
			UserID:    entitycommon.Id(userJwtClaims.UserId),
		},
	)
	if err != nil {
		return global.Err(err)
	}

	return ctx.Status(200).JSON(c.getResponse(output.Attempt, output.Quiz))
}

func (self *QuizzesEndpoints) StartQuizAttempt(ctx *fiber.Ctx) error {
	c := &StartQuizAttemptRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	output, err := self.Services.LectureQuiz.StartAttempt(
		lecturequiz.StartAttemptInput{
			LectureSlug: entitycommon.Slug{Slug: c.Params.LectureSlug},
			UserID:      entitycommon.Id(userJwtClaims.UserId),
		},
	)
	if err != nil {
		return global.Err(err)
	}

	return ctx.Status(200).JSON(c.getResponse(output.Quiz, output.Attempt))
}

func (self *QuizzesEndpoints) SetAnswer(ctx *fiber.Ctx) error {
	c := &SetAnswerRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	_, err := self.Services.LectureQuiz.SetAnswer(
		lecturequiz.SetAnswerInput{
			UserID:      entitycommon.Id(userJwtClaims.UserId),
			LectureSlug: entitycommon.Slug{Slug: c.Params.LectureSlug},
			QuestionID:  entitycommon.Id(c.Params.QuestionId),
			Answer:      c.Body.Answer,
		},
	)
	if err != nil {
		return global.Err(err)
	}

	ctx.Status(200)
	return nil
}

func (self *QuizzesEndpoints) FinishAttempt(ctx *fiber.Ctx) error {
	c := &FinishAttemptRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	_, err := self.Services.LectureQuiz.FinishAttempt(
		lecturequiz.FinishAttemptInput{
			LectureSlug: entitycommon.Slug{Slug: c.Params.LectureSlug},
			UserID:      entitycommon.Id(userJwtClaims.UserId),
		},
	)
	if err != nil {
		return global.Err(err)
	}

	ctx.Status(200)
	return nil
	// .JSON(c.getResponse(output.Attempt, output.Quiz))
}
