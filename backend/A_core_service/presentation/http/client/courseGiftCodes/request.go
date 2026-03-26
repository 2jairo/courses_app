package coursegiftcodes

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type GetOrderItemGiftCodesRequest struct {
	Params struct {
		OrderID  int64 `json:"orderId" validate:"required"`
		CourseID int64 `json:"courseId" validate:"required"`
	}
}

type RedeemGiftCodeRequest struct {
	Body struct {
		Code string `json:"code" validate:"required,min=1"`
	}
}

func (req *GetOrderItemGiftCodesRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(&req.Params, ctx.ParamsParser)
}

func (req *RedeemGiftCodeRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(&req.Body, ctx.BodyParser)
}
