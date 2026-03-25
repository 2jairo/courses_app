package paymentmethod

import entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"

type CreateSetupIntentInput struct {
	UserId entitycommon.Id
}

type FinishSetupIntentInput struct {
	UserId        entitycommon.Id
	SetupIntentId string
	IsDefault     bool
}

type FindUserPaymentMethodsInput struct {
	UserId entitycommon.Id
}

type RemovePaymentMethodInput struct {
	UserId          entitycommon.Id
	PaymentMethodId entitycommon.Id
}

type UpdatePaymentMethodInputAddress struct {
	City       *string
	Country    *string
	Line1      *string
	Line2      *string
	PostalCode *string
	State      *string
}

type UpdatePaymentMethodInputBillingDetails struct {
	Address *UpdatePaymentMethodInputAddress
	Email   *string
	Name    *string
	Phone   *string
}

type UpdatePaymentMethodInput struct {
	UserId          entitycommon.Id
	PaymentMethodId entitycommon.Id
	IsDefault       *bool
	ExpiryMonth     *int16
	ExpiryYear      *int16
	BillingDetails  *UpdatePaymentMethodInputBillingDetails
}
