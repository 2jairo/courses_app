package payments

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/stripe/stripe-go/v84"
)

type CreatePaymentIntentOutput struct {
	Order               *entity.Order
	Payment             *entity.Payment
	StripePaymentIntent *stripe.PaymentIntent
}
