package coursegiftcodes

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	coursegiftcodes "github.com/2jairo/courses_app/backend/A_core_service/application/services/courseGiftCodes"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CourseGiftCodesEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *CourseGiftCodesEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())

	r.Get("/:orderId/:courseId", self.GetOrderItemGiftCodes)
	r.Post("/redeem", self.RedeemGiftCode)
}

func (self *CourseGiftCodesEndpoints) GetOrderItemGiftCodes(ctx *fiber.Ctx) error {
	c := &GetOrderItemGiftCodesRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	giftCodes, err := self.Services.CourseGiftCodes.GetOrderItemGiftCodes(
		coursegiftcodes.GetOrderItemGiftCodesInput{
			OrderID:  entitycommon.Id(c.Params.OrderID),
			CourseID: entitycommon.Id(c.Params.CourseID),
			UserID:   entitycommon.Id(userJwtClaims.UserId),
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(giftCodes))
}

func (self *CourseGiftCodesEndpoints) RedeemGiftCode(ctx *fiber.Ctx) error {
	req := &RedeemGiftCodeRequest{}
	if err := req.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	giftCode, err := self.Services.CourseGiftCodes.RedeemGiftCode(
		coursegiftcodes.RedeemGiftCodeInput{
			Code:   req.Body.Code,
			UserID: entitycommon.Id(userJwtClaims.UserId),
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(req.getResponse(giftCode))
}
