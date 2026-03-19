package lecturecomments

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type ListCommentsRequest struct {
	Params struct {
		LectureSlug string
	}
	Query struct {
		ParentCommentID *int64 `query:"parentCommentId"`
		utils.Pagination
	}
}

func (self *ListCommentsRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return err
	}
	return u.DefaultBind(&self.Query, ctx.QueryParser)
}

type CreateCommentRequest struct {
	Params struct {
		LectureSlug string
	}
	Body struct {
		ParentCommentID *int64 `json:"parentCommentId"`
		Body            string `json:"body" validate:"required,min=1,max=2000"`
	}
}

func (self *CreateCommentRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return err
	}
	return u.DefaultBind(&self.Body, ctx.BodyParser)
}

type UpdateCommentRequest struct {
	Params struct {
		CommentID int64
	}
	Body struct {
		Body string `json:"body" validate:"min=1,max=2000"`
	}
}

func (self *UpdateCommentRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return err
	}
	return u.DefaultBind(&self.Body, ctx.BodyParser)
}

type DeleteCommentRequest struct {
	Params struct {
		CommentID int64
	}
}

func (self *DeleteCommentRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(&self.Params, ctx.ParamsParser)
}
