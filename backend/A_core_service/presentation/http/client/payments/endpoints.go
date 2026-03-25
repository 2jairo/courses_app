package payments

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/payments"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type PaymentsEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *PaymentsEndpoints) RegisterRoutes(r fiber.Router) {
	requiredAuth := self.Services.Middleware.ClientAuth()

	r.Post("/intent", requiredAuth, self.CreatePaymentIntent)
}

func (self *PaymentsEndpoints) CreatePaymentIntent(ctx *fiber.Ctx) error {
	c := &CreatePaymentIntentRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	var paymentMethodId *entitycommon.Id = nil
	if c.Body.PaymentMethodId != nil {
		paymentMethodId = utils.Ref(entitycommon.Id(*c.Body.PaymentMethodId))
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	output, err := self.Services.Payments.CreatePaymentIntent(
		payments.CreatePaymentIntentInput{
			UserID:            entitycommon.Id(userJwtClaims.UserId),
			SavePaymentMethod: c.Body.SavePaymentMethod,
			PaymentMethodId:   paymentMethodId,
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(output.StripePaymentIntent))
}
