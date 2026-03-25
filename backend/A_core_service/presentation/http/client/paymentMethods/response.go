package paymentmethods

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type CreateSetupIntentResponse struct {
	ClientSecret string `json:"clientSecret"`
}

type FinishSetupIntentResponse struct {
	ID             int64                  `json:"id"`
	CreatedAt      time.Time              `json:"createdAt"`
	UpdatedAt      time.Time              `json:"updatedAt"`
	Provider       entity.PaymentProvider `json:"provider"`
	MethodType     string                 `json:"methodType"` // Stripe payment method type, such as card, paypal, or sepa_debit.
	Token          string                 `json:"token"`      // Stripe -> payment_method_id
	LastFour       *string                `json:"lastFour,omitempty"`
	ExpiryMonth    *int16                 `json:"expiryMonth,omitempty"`
	ExpiryYear     *int16                 `json:"expiryYear,omitempty"`
	CardholderName *string                `json:"cardholderName,omitempty"`
	CardBrand      *entity.CardBrand      `json:"cardBrand,omitempty"`
	CardFunding    *entity.CardFunding    `json:"cardFunding,omitempty"`
	Email          *string                `json:"email,omitempty"`
	BankName       *string                `json:"bankName,omitempty"`    // For bank-based methods (SEPA, BACS, US Bank Account, AU BECS)
	BankCode       *string                `json:"bankCode,omitempty"`    // BSB, sort code, bank code
	AccountType    *string                `json:"accountType,omitempty"` // "checking", "savings" for US bank accounts
	Country        *string                `json:"country,omitempty"`     // ISO country code (For methods that have a country (PayPal, SEPA, iDEAL, etc.))
	IsDefault      bool                   `json:"isDefault"`
}

func buildFinishSetupIntentResponse(
	pi *entity.PaymentMethod,
) FinishSetupIntentResponse {
	return FinishSetupIntentResponse{
		ID:             int64(pi.Model.ID),
		CreatedAt:      pi.CreatedAt,
		UpdatedAt:      pi.UpdatedAt,
		Provider:       pi.Provider,
		MethodType:     pi.MethodType,
		Token:          pi.Token,
		LastFour:       pi.LastFour,
		ExpiryMonth:    pi.ExpiryMonth,
		ExpiryYear:     pi.ExpiryYear,
		CardholderName: pi.CardholderName,
		CardBrand:      pi.CardBrand,
		CardFunding:    pi.CardFunding,
		Email:          pi.Email,
		BankName:       pi.BankName,
		BankCode:       pi.BankCode,
		AccountType:    pi.AccountType,
		Country:        pi.Country,
		IsDefault:      pi.IsDefault,
	}
}

func (self *FinishSetupIntentRequest) getResponse(paymentMethod *entity.PaymentMethod) *FinishSetupIntentResponse {
	resp := buildFinishSetupIntentResponse(paymentMethod)
	return &resp
}

func (self *CreateSetupIntentRequest) getResponse(clientSecret string) *CreateSetupIntentResponse {
	return &CreateSetupIntentResponse{
		ClientSecret: clientSecret,
	}
}

func (self *FindUserPaymentMethodsRequest) getResponse(paymentMethods []entity.PaymentMethod) []FinishSetupIntentResponse {
	rows := make([]FinishSetupIntentResponse, len(paymentMethods))
	for i, pm := range paymentMethods {
		rows[i] = buildFinishSetupIntentResponse(&pm)
	}

	return rows
}

func (self *UpdatePaymentMethodRequest) getResponse(paymentMethod *entity.PaymentMethod) *FinishSetupIntentResponse {
	resp := buildFinishSetupIntentResponse(paymentMethod)
	return &resp
}
