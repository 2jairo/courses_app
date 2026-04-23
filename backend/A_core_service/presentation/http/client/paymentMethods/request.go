package paymentmethods

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type CreateSetupIntentRequest struct {
}

func (self *CreateSetupIntentRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	return nil
}

type FindUserPaymentMethodsRequest struct {
}

func (self *FindUserPaymentMethodsRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	return nil
}

type FinishSetupIntentRequest struct {
	Body struct {
		SetupIntentId string `json:"setupIntentId" validate:"required"`
		IsDefault     bool   `json:"isDefault"`
	}
}

func (self *FinishSetupIntentRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	return utils.DefaultBind(&self.Body, ctx.BodyParser)
}

type RemovePaymentMethodRequest struct {
	Params struct {
		PaymentMethodId int64 `params:"paymentMethodId" validate:"required"`
	}
}

func (self *RemovePaymentMethodRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	return utils.DefaultBind(&self.Params, ctx.ParamsParser)
}

type UpdatePaymentMethodRequestBodyAddress struct {
	City       *string `json:"city,omitempty"`
	Country    *string `json:"country,omitempty"`
	Line1      *string `json:"line1,omitempty"`
	Line2      *string `json:"line2,omitempty"`
	PostalCode *string `json:"postalCode,omitempty"`
	State      *string `json:"state,omitempty"`
}

type UpdatePaymentMethodRequestBodyBillingDetails struct {
	Address *UpdatePaymentMethodRequestBodyAddress `json:"address,omitempty"`
	Email   *string                                `json:"email,omitempty"`
	Name    *string                                `json:"name,omitempty"`
	Phone   *string                                `json:"phone,omitempty"`
}

type UpdatePaymentMethodRequest struct {
	Params struct {
		PaymentMethodId int64 `params:"paymentMethodId" validate:"required"`
	}
	Body struct {
		IsDefault      *bool                                         `json:"isDefault,omitempty"`
		ExpiryMonth    *int16                                        `json:"expiryMonth,omitempty"`
		ExpiryYear     *int16                                        `json:"expiryYear,omitempty"`
		BillingDetails *UpdatePaymentMethodRequestBodyBillingDetails `json:"billingDetails,omitempty"`
	}
}

func (self *UpdatePaymentMethodRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := utils.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return global.Err(err)
	}
	return utils.DefaultBind(&self.Body, ctx.BodyParser)
}
