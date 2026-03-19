package lecturecomments

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	lecturecomment "github.com/2jairo/courses_app/backend/A_core_service/application/services/lectureComment"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/middlewares"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type LectureCommentsEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *LectureCommentsEndpoints) RegisterRoutes(r fiber.Router) {
	auth := self.Services.Middleware.ClientAuth()
	authOptional := self.Services.Middleware.ClientAuth(middlewares.ClientAuthParams{Optional: true})

	r.Get("/:lectureSlug", authOptional, self.ListComments)
	r.Post("/:lectureSlug", auth, self.CreateComment)
	r.Put("/:commentId", auth, self.UpdateComment)
	r.Delete("/:commentId", auth, self.DeleteComment)
}

func (self *LectureCommentsEndpoints) ListComments(ctx *fiber.Ctx) error {
	c := &ListCommentsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	var parentId *entitycommon.Id
	if c.Query.ParentCommentID != nil {
		id := entitycommon.Id(*c.Query.ParentCommentID)
		parentId = &id
	}

	comments, err := self.Services.LectureComment.FindComments(
		lecturecomment.FindCommentsInput{
			LectureSlug:     c.Params.LectureSlug,
			ParentCommentID: parentId,
			Pagination:      &c.Query.Pagination,
		},
	)
	if err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(comments, userJwtClaims))
}

func (self *LectureCommentsEndpoints) CreateComment(ctx *fiber.Ctx) error {
	c := &CreateCommentRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	var parentId *entitycommon.Id
	if c.Body.ParentCommentID != nil {
		id := entitycommon.Id(*c.Body.ParentCommentID)
		parentId = &id
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	comment, err := self.Services.LectureComment.CreateComment(
		lecturecomment.CreateCommentInput{
			AuthorID:        entitycommon.Id(userJwtClaims.UserId),
			LectureSlug:     c.Params.LectureSlug,
			ParentCommentID: parentId,
			Body:            c.Body.Body,
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(fiber.StatusCreated).JSON(c.getResponse(comment, userJwtClaims))
}

func (self *LectureCommentsEndpoints) UpdateComment(ctx *fiber.Ctx) error {
	c := &UpdateCommentRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	comment, err := self.Services.LectureComment.UpdateComment(
		lecturecomment.UpdateCommentInput{
			CommentID: entitycommon.Id(c.Params.CommentID),
			AuthorID:  entitycommon.Id(userJwtClaims.UserId),
			Body:      c.Body.Body,
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(comment, userJwtClaims))
}

func (self *LectureCommentsEndpoints) DeleteComment(ctx *fiber.Ctx) error {
	c := &DeleteCommentRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	err := self.Services.LectureComment.DeleteComment(
		lecturecomment.DeleteCommentInput{
			CommentID: entitycommon.Id(c.Params.CommentID),
			AuthorID:  entitycommon.Id(userJwtClaims.UserId),
		},
	)
	if err != nil {
		return err
	}

	return ctx.SendStatus(fiber.StatusNoContent)
}
