package paymentmethods

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	paymentmethod "github.com/2jairo/courses_app/backend/A_core_service/application/services/paymentMethod"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type PaymentMethodsEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *PaymentMethodsEndpoints) RegisterRoutes(r fiber.Router) {
	requiredAuth := self.Services.Middleware.ClientAuth()

	r.Get("/", requiredAuth, self.FindUserPaymentMethods)
	r.Post("/setup-intent", requiredAuth, self.CreateSetupIntent)
	r.Post("/setup-intent/finish", requiredAuth, self.FinishSetupIntent)
	r.Delete("/:paymentMethodId", requiredAuth, self.RemovePaymentMethod)
	r.Put("/:paymentMethodId", requiredAuth, self.UpdatePaymentMethod)
}

func (self *PaymentMethodsEndpoints) FindUserPaymentMethods(ctx *fiber.Ctx) error {
	c := &FindUserPaymentMethodsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	paymentMethods, err := self.Services.PaymentMethod.FindUserPaymentMethods(
		paymentmethod.FindUserPaymentMethodsInput{UserId: entitycommon.Id(userJwtClaims.UserId)},
	)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(paymentMethods))
}

func (self *PaymentMethodsEndpoints) CreateSetupIntent(ctx *fiber.Ctx) error {
	c := &CreateSetupIntentRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	setupIntent, err := self.Services.PaymentMethod.CreateSetupIntent(
		paymentmethod.CreateSetupIntentInput{UserId: entitycommon.Id(userJwtClaims.UserId)},
	)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(setupIntent.ClientSecret))
}

func (self *PaymentMethodsEndpoints) FinishSetupIntent(ctx *fiber.Ctx) error {
	c := &FinishSetupIntentRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	paymentMethod, err := self.Services.PaymentMethod.FinishSetupIntent(
		paymentmethod.FinishSetupIntentInput{
			UserId:        entitycommon.Id(userJwtClaims.UserId),
			SetupIntentId: c.Body.SetupIntentId,
			IsDefault:     c.Body.IsDefault,
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(paymentMethod))
}

func (self *PaymentMethodsEndpoints) RemovePaymentMethod(ctx *fiber.Ctx) error {
	c := &RemovePaymentMethodRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	err := self.Services.PaymentMethod.RemovePaymentMethod(
		paymentmethod.RemovePaymentMethodInput{
			UserId:          entitycommon.Id(userJwtClaims.UserId),
			PaymentMethodId: entitycommon.Id(c.Params.PaymentMethodId),
		},
	)
	if err != nil {
		return err
	}

	return ctx.SendStatus(204)
}

func (self *PaymentMethodsEndpoints) UpdatePaymentMethod(ctx *fiber.Ctx) error {
	c := &UpdatePaymentMethodRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	var billingDetails *paymentmethod.UpdatePaymentMethodInputBillingDetails
	if c.Body.BillingDetails != nil {
		billingDetails = &paymentmethod.UpdatePaymentMethodInputBillingDetails{
			Email: c.Body.BillingDetails.Email,
			Name:  c.Body.BillingDetails.Name,
			Phone: c.Body.BillingDetails.Phone,
		}
		if c.Body.BillingDetails.Address != nil {
			billingDetails.Address = &paymentmethod.UpdatePaymentMethodInputAddress{
				City:       c.Body.BillingDetails.Address.City,
				Country:    c.Body.BillingDetails.Address.Country,
				Line1:      c.Body.BillingDetails.Address.Line1,
				Line2:      c.Body.BillingDetails.Address.Line2,
				PostalCode: c.Body.BillingDetails.Address.PostalCode,
				State:      c.Body.BillingDetails.Address.State,
			}
		}
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	paymentMethod, err := self.Services.PaymentMethod.UpdatePaymentMethod(
		paymentmethod.UpdatePaymentMethodInput{
			UserId:          entitycommon.Id(userJwtClaims.UserId),
			PaymentMethodId: entitycommon.Id(c.Params.PaymentMethodId),
			IsDefault:       c.Body.IsDefault,
			ExpiryMonth:     c.Body.ExpiryMonth,
			ExpiryYear:      c.Body.ExpiryYear,
			BillingDetails:  billingDetails,
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(paymentMethod))
}
