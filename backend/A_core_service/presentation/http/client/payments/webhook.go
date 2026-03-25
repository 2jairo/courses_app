package payments

import (
	"fmt"
	"io"

	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
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
		return err
	}

	sigHeader := ctx.Get("Stripe-Signature")
	fmt.Printf("sigHeader: %v\n", sigHeader)
	event, err := webhook.ConstructEvent(
		payload,
		sigHeader,
		config.StripeApiWhSec,
	)
	if err != nil {
		return err
	}

	return self.Services.Payments.HandleWebhookEvent(&event)
}
