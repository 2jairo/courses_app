package payments

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CreatePaymentIntentRequest struct {
	Body CreatePaymentIntentRequestBody
}

type CreatePaymentIntentRequestBody struct {
	PaymentMethodId   *int64 `json:"paymentMethodId"`
	SavePaymentMethod bool   `json:"savePaymentMethod"`
}

type AddCourseToLibraryRequest struct {
	Body struct {
		CourseID int64 `json:"courseId" validate:"required"`
	}
}

func (self *CreatePaymentIntentRequestBody) HasAtLeastOneField() bool {
	return self.PaymentMethodId != nil || self.SavePaymentMethod
}

func (self *CreatePaymentIntentRequest) bind(appUtils *utils.AppUtils, ctx *fiber.Ctx) error {
	return appUtils.DefaultBind(&self.Body, ctx.BodyParser)
}

func (self *AddCourseToLibraryRequest) bind(appUtils *utils.AppUtils, ctx *fiber.Ctx) error {
	return appUtils.DefaultBind(&self.Body, ctx.BodyParser)
}
