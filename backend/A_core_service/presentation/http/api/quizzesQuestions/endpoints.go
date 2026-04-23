package quizzesquestions

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	coursepermissions "github.com/2jairo/courses_app/backend/A_core_service/application/services/coursePermissions"
	lecturequiz "github.com/2jairo/courses_app/backend/A_core_service/application/services/lectureQuiz"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
	"gorm.io/datatypes"
)

type QuizzesQuestionsEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *QuizzesQuestionsEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())

	r.Post("/create/:quizId", self.CreateQuestion)              // Write
	r.Put("/:questionId", self.UpdateQuestion)                  // Write
	r.Put("/:questionId/position", self.UpdateQuestionPosition) // Write
	r.Delete("/:questionId", self.DeleteQuestion)               // Write
}

func (self *QuizzesQuestionsEndpoints) CreateQuestion(ctx *fiber.Ctx) error {
	c := &CreateQuestionRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	// Get CourseId for permission checking
	courseId, err := self.Services.LectureQuiz.GetQuizCourseId(entitycommon.Id(c.Params.QuizId))
	if err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRole(
		coursepermissions.HasRoleInput{
			CourseId:      courseId,
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleWrite,
		},
	); err != nil {
		return global.Err(err)
	}

	validatedOptions, _, err := c.getOptions()
	if err != nil {
		return global.Err(err)
	}

	resp, err := self.Services.LectureQuiz.CreateQuestion(
		lecturequiz.CreateQuestionInput{
			QuizID:       entitycommon.Id(c.Params.QuizId),
			Status:       c.Body.Status,
			Kind:         c.Body.Kind,
			QuestionText: c.Body.QuestionText,
			Options:      validatedOptions,
			Explanation:  c.Body.Explanation,
			Points:       c.Body.Points,
		},
	)
	if err != nil {
		return global.Err(err)
	}

	return ctx.Status(201).JSON(c.getResponse(resp.Question))
}

func (self *QuizzesQuestionsEndpoints) UpdateQuestion(ctx *fiber.Ctx) error {
	c := &UpdateQuestionRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	// Get CourseId for permission checking
	courseId, err := self.Services.LectureQuiz.GetQuestionCourseId(entitycommon.Id(c.Params.QuestionId))
	if err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRole(
		coursepermissions.HasRoleInput{
			CourseId:      courseId,
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleWrite,
		},
	); err != nil {
		return global.Err(err)
	}

	updateInput := lecturequiz.UpdateQuestionInput{
		QuestionID:   entitycommon.Id(c.Params.QuestionId),
		Status:       c.Body.Status,
		Kind:         c.Body.Kind,
		QuestionText: c.Body.QuestionText,
		Explanation:  c.Body.Explanation,
		Points:       c.Body.Points,
		Options:      (*datatypes.JSON)(c.Body.Options),
	}

	if c.Body.Kind != nil && c.Body.Options != nil {
		opts, _, err := c.getOptions()
		if err != nil {
			return global.Err(err)
		}
		updateInput.Options = &opts
	}

	resp, err := self.Services.LectureQuiz.UpdateQuestion(updateInput)
	if err != nil {
		return global.Err(err)
	}

	return ctx.Status(200).JSON(c.getResponse(resp.Question))
}

func (self *QuizzesQuestionsEndpoints) DeleteQuestion(ctx *fiber.Ctx) error {
	c := &DeleteQuestionRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	// Get CourseId for permission checking
	courseId, err := self.Services.LectureQuiz.GetQuestionCourseId(entitycommon.Id(c.QuestionId))
	if err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRole(
		coursepermissions.HasRoleInput{
			CourseId:      courseId,
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleWrite,
		},
	); err != nil {
		return global.Err(err)
	}

	err = self.Services.LectureQuiz.DeleteQuestion(
		lecturequiz.DeleteQuestionInput{
			QuestionID: entitycommon.Id(c.QuestionId),
		},
	)
	if err != nil {
		return global.Err(err)
	}

	ctx.Status(fiber.StatusOK)
	return nil
}

func (self *QuizzesQuestionsEndpoints) UpdateQuestionPosition(ctx *fiber.Ctx) error {
	c := &UpdateQuestionPositionRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	// Get CourseId for permission checking
	courseId, err := self.Services.LectureQuiz.GetQuestionCourseId(entitycommon.Id(c.Params.QuestionId))
	if err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRole(
		coursepermissions.HasRoleInput{
			CourseId:      courseId,
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleWrite,
		},
	); err != nil {
		return global.Err(err)
	}

	err = self.Services.LectureQuiz.UpdateQuestionPosition(
		lecturequiz.UpdateQuestionPositionInput{
			QuestionID:  entitycommon.Id(c.Params.QuestionId),
			QuizID:      entitycommon.Id(c.Body.QuizId),
			NewPosition: c.Body.Position,
		},
	)
	if err != nil {
		return global.Err(err)
	}

	ctx.Status(fiber.StatusOK)
	return nil
}
