package coursereviews

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CreateReviewRequest struct {
	Params struct {
		CourseSlug string
	}
	Body struct {
		Rating  int32  `json:"rating" validate:"required,min=1,max=5"`
		Comment string `json:"comment" validate:"required,min=1,max=2000"`
	}
}

type UpdateReviewRequest struct {
	Params struct {
		ReviewID int64 `params:"reviewId"`
	}
	Body struct {
		Rating  *int32  `json:"rating" validate:"omitempty,min=1,max=5"`
		Comment *string `json:"comment" validate:"omitempty,min=1,max=2000"`
	}
}

type ListReviewsRequest struct {
	Params struct {
		CourseSlug string `params:"courseSlug"`
	}
	Query struct {
		utils.Pagination
		Rating int32 `query:"rating" json:"rating" validate:"omitempty,min=1,max=5"`
	}
}

func (req *CreateReviewRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := ctx.ParamsParser(&req.Params); err != nil {
		return err
	}
	return u.DefaultBind(&req.Body, ctx.BodyParser)
}

func (req *UpdateReviewRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := ctx.ParamsParser(&req.Params); err != nil {
		return err
	}
	return u.DefaultBind(&req.Body, ctx.BodyParser)
}

func (req *ListReviewsRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := ctx.ParamsParser(&req.Params); err != nil {
		return err
	}
	return u.DefaultBind(&req.Query, ctx.QueryParser)
}
