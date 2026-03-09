package quizzes

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	coursepermissions "github.com/2jairo/courses_app/backend/A_core_service/application/services/coursePermissions"
	lecturequiz "github.com/2jairo/courses_app/backend/A_core_service/application/services/lectureQuiz"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type QuizzesEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *QuizzesEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())

	r.Post("/create/:courseId", self.CreateQuiz)     // Write
	r.Get("/:courseId", self.GetQuizzes)             // Read
	r.Get("/:courseId/:quizId", self.GetQuizDetails) // Read
	r.Delete("/:quizId", self.DeleteQuiz)            // Write
	r.Put("/:quizId", self.UpdateQuiz)               // Write
}

func (self *QuizzesEndpoints) UpdateQuiz(ctx *fiber.Ctx) error {
	c := &UpdateQuizRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	courseId, err := self.Services.LectureQuiz.GetQuizCourseId(entitycommon.Id(c.QuizId))
	if err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRole(
		coursepermissions.HasRoleInput{
			CourseId:      courseId,
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleWrite,
		},
	); err != nil {
		return err
	}

	quiz, err := self.Services.LectureQuiz.UpdateQuiz(
		lecturequiz.UpdateQuizInput{
			QuizID:                 entitycommon.Id(c.QuizId),
			Title:                  c.Body.Title,
			TimeLimitSecs:          c.Body.TimeLimitSecs,
			PassingScorePercentage: c.Body.PassingScorePercentage,
			ShuffleQuestions:       c.Body.ShuffleQuestions,
			ShowCorrectAnswers:     c.Body.ShowCorrectAnswers,
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(quiz))
}

func (self *QuizzesEndpoints) CreateQuiz(ctx *fiber.Ctx) error {
	c := &CreateQuizRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	// Get CourseId for permission checking
	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRole(
		coursepermissions.HasRoleInput{
			CourseId:      entitycommon.Id(c.Params.CourseId),
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleWrite,
		},
	); err != nil {
		return err
	}

	resp, err := self.Services.LectureQuiz.CreateQuiz(
		lecturequiz.CreateQuizInput{
			CourseId:               entitycommon.Id(c.Params.CourseId),
			TimeLimitSecs:          c.Body.TimeLimitSecs,
			PassingScorePercentage: c.Body.PassingScorePercentage,
			ShuffleQuestions:       c.Body.ShuffleQuestions,
			ShowCorrectAnswers:     c.Body.ShowCorrectAnswers,
			Title:                  c.Body.Title,
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(201).JSON(c.getResponse(resp.Quiz))
}

func (self *QuizzesEndpoints) DeleteQuiz(ctx *fiber.Ctx) error {
	c := &DeleteQuizRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	// Get CourseId for permission checking
	courseId, err := self.Services.LectureQuiz.GetQuizCourseId(entitycommon.Id(c.QuizId))
	if err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRole(
		coursepermissions.HasRoleInput{
			CourseId:      courseId,
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleWrite,
		},
	); err != nil {
		return err
	}

	err = self.Services.LectureQuiz.DeleteQuiz(
		lecturequiz.DeleteQuizInput{
			QuizID: entitycommon.Id(c.QuizId),
		},
	)
	if err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}

func (self *QuizzesEndpoints) GetQuizzes(ctx *fiber.Ctx) error {
	c := &GetQuizzesRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	// Get CourseId for permission checking
	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRole(
		coursepermissions.HasRoleInput{
			CourseId:      entitycommon.Id(c.Params.CourseId),
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleRead,
		},
	); err != nil {
		return err
	}

	quizzes, err := self.Services.LectureQuiz.GetQuizzesByCourse(
		lecturequiz.GetQuizzesInput{
			CourseId:     entitycommon.Id(c.Params.CourseId),
			Pagination:   &c.Query.Pagination,
			QueryByTitle: c.Query.QueryByTitle,
			SortOrder:    c.Query.SortOrder,
			SortBy:       c.Query.SortBy,
		},
	)
	if err != nil {
		return err
	}

	ctx.Status(200).JSON(c.getResponse(quizzes))
	return nil
}

func (self *QuizzesEndpoints) GetQuizDetails(ctx *fiber.Ctx) error {
	c := &GetQuizDetailsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	// Get CourseId for permission checking
	courseId, err := self.Services.LectureQuiz.GetQuizCourseId(entitycommon.Id(c.QuizId))
	if err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRole(
		coursepermissions.HasRoleInput{
			CourseId:      courseId,
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleRead,
		},
	); err != nil {
		return err
	}

	quiz, err := self.Services.LectureQuiz.GetQuizDetails(entitycommon.Id(c.QuizId))
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(quiz))
}
