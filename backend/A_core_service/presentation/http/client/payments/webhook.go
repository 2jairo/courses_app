package payments

import (
	"io"

	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
	"github.com/stripe/stripe-go/v84/webhook"
)

type StripeWebhookEndpoint struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *StripeWebhookEndpoint) RegisterRoutes(r fiber.Router) {
	r.Post("/webhook", self.Webhook)
}

func (self *StripeWebhookEndpoint) Webhook(ctx *fiber.Ctx) error {
	stream := ctx.Context().RequestBodyStream()

	payload, err := io.ReadAll(stream)
	if err != nil {
		return global.Err(err)
	}

	sigHeader := ctx.Get("Stripe-Signature")

	event, err := webhook.ConstructEvent(
		payload,
		sigHeader,
		config.StripeApiWhSec,
	)
	if err != nil {
		return global.Err(err)
	}

	return self.Services.Payments.HandleWebhookEvent(&event)
}
