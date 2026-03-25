package db

import (
	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/stripe/stripe-go/v84"
)

func stripeNew() *stripe.Client {
	return stripe.NewClient(config.StripeApiSk)
}
