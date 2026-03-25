package payments

import (
	"github.com/stripe/stripe-go/v84"
)

type CreatePaymentIntentResponse struct {
	ClientSecret string `json:"clientSecret"`
	Status       string `json:"status"`
}

func (self *CreatePaymentIntentRequest) getResponse(stripePi *stripe.PaymentIntent) *CreatePaymentIntentResponse {
	return &CreatePaymentIntentResponse{
		ClientSecret: stripePi.ClientSecret,
		Status:       string(stripePi.Status),
	}
}
