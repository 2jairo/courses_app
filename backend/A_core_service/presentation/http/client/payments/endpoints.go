package payments

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/payments"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type PaymentsEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *PaymentsEndpoints) RegisterRoutes(r fiber.Router) {
	requiredAuth := self.Services.Middleware.ClientAuth()

	r.Post("/intent", requiredAuth, self.CreatePaymentIntent)
	r.Post("/add-to-library", requiredAuth, self.AddCourseToLibrary)
}

func (self *PaymentsEndpoints) CreatePaymentIntent(ctx *fiber.Ctx) error {
	c := &CreatePaymentIntentRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
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
		return global.Err(err)
	}

	return ctx.Status(200).JSON(c.getResponse(output.StripePaymentIntent))
}

func (self *PaymentsEndpoints) AddCourseToLibrary(ctx *fiber.Ctx) error {
	c := &AddCourseToLibraryRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	_, err := self.Services.Payments.AddCourseToLibrary(
		payments.AddCourseToLibraryInput{
			UserID:   entitycommon.Id(userJwtClaims.UserId),
			CourseID: entitycommon.Id(c.Body.CourseID),
		},
	)
	if err != nil {
		return global.Err(err)
	}

	return ctx.SendStatus(fiber.StatusCreated)
}
