package paymentmethod

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/stripe/stripe-go/v84"
)

type PaymentMethodService struct {
	Repo  *infrastructure.AppRepositories
	Utils *utils.AppUtils
}

func (self *PaymentMethodService) CreateSetupIntent(input CreateSetupIntentInput) (*stripe.SetupIntent, error) {
	user := &entity.User{Model: entitycommon.Model{ID: input.UserId}}
	if err := self.Repo.User.FindOne(user); err != nil {
		return nil, err
	}

	return self.Repo.PaymentMethod.CreateSetupIntent(user.StripeId)
}

func (self *PaymentMethodService) FinishSetupIntent(input FinishSetupIntentInput) (*entity.PaymentMethod, error) {
	user := &entity.User{Model: entitycommon.Model{ID: input.UserId}}
	if err := self.Repo.User.FindOne(user); err != nil {
		return nil, err
	}

	stripePaymentMethod, err := self.Repo.PaymentMethod.FinishSetupIntent(
		user.StripeId,
		input.SetupIntentId,
	)
	if err != nil {
		return nil, err
	}

	paymentMethod := entity.PaymentMethodFromStripe(stripePaymentMethod, user.ID, input.IsDefault)
	createError := self.Repo.PaymentMethod.Create(paymentMethod)
	return paymentMethod, createError
}

func (self *PaymentMethodService) FindUserPaymentMethods(input FindUserPaymentMethodsInput) ([]entity.PaymentMethod, error) {
	return self.Repo.PaymentMethod.Find(
		&entity.PaymentMethod{UserID: input.UserId},
		entity.PaymentMethodPreloadOptions{},
		nil,
	)
}

func (self *PaymentMethodService) RemovePaymentMethod(input RemovePaymentMethodInput) error {
	paymentMethod := &entity.PaymentMethod{
		Model:  entitycommon.Model{ID: input.PaymentMethodId},
		UserID: input.UserId,
	}

	if err := self.Repo.PaymentMethod.FindOne(paymentMethod, entity.PaymentMethodPreloadOptions{}); err != nil {
		return err
	}

	// Detach from Stripe
	if _, err := self.Repo.PaymentMethod.DetachStripePaymentMethod(paymentMethod.Token); err != nil {
		return err
	}

	return self.Repo.PaymentMethod.Delete(paymentMethod)
}

func (self *PaymentMethodService) UpdatePaymentMethod(input UpdatePaymentMethodInput) (*entity.PaymentMethod, error) {
	paymentMethod := &entity.PaymentMethod{
		Model:  entitycommon.Model{ID: input.PaymentMethodId},
		UserID: input.UserId, // Ensure it belongs to the user
	}

	if err := self.Repo.PaymentMethod.FindOne(paymentMethod, entity.PaymentMethodPreloadOptions{}); err != nil {
		return nil, err
	}

	updates := &entity.PaymentMethod{}
	selectCols := []string{}

	if input.IsDefault != nil {
		updates.IsDefault = *input.IsDefault
		selectCols = append(selectCols, "IsDefault")

		// If setting to default, it might make sense to unset default for others.
		// Doing a simple update on this entity for now.
	}

	callStripe := false
	stripeParams := &stripe.PaymentMethodUpdateParams{
		Card: &stripe.PaymentMethodUpdateCardParams{},
	}

	if input.ExpiryMonth != nil || input.ExpiryYear != nil {
		callStripe = true

		if input.ExpiryMonth != nil {
			expMo := int64(*input.ExpiryMonth)
			stripeParams.Card.ExpMonth = &expMo
			updates.ExpiryMonth = input.ExpiryMonth
			selectCols = append(selectCols, "ExpiryMonth")
		}

		if input.ExpiryYear != nil {
			expYr := int64(*input.ExpiryYear)
			stripeParams.Card.ExpYear = &expYr
			updates.ExpiryYear = input.ExpiryYear
			selectCols = append(selectCols, "ExpiryYear")
		}
	}
	if input.BillingDetails != nil {
		callStripe = true
		stripeParams.BillingDetails = &stripe.PaymentMethodUpdateBillingDetailsParams{
			Email: input.BillingDetails.Email,
			Name:  input.BillingDetails.Name,
			Phone: input.BillingDetails.Phone,
		}

		if input.BillingDetails.Name != nil {
			updates.CardholderName = input.BillingDetails.Name
			selectCols = append(selectCols, "CardholderName")
		}

		if input.BillingDetails.Address != nil {
			stripeParams.BillingDetails.Address = &stripe.AddressParams{
				City:       input.BillingDetails.Address.City,
				Country:    input.BillingDetails.Address.Country,
				Line1:      input.BillingDetails.Address.Line1,
				Line2:      input.BillingDetails.Address.Line2,
				PostalCode: input.BillingDetails.Address.PostalCode,
				State:      input.BillingDetails.Address.State,
			}
		}
	}

	if callStripe {
		if _, err := self.Repo.PaymentMethod.UpdateStripePaymentMethod(paymentMethod.Token, stripeParams); err != nil {
			return nil, err
		}
	}

	if len(selectCols) > 0 {
		return self.Repo.PaymentMethod.Update(&entity.PaymentMethod{Model: entitycommon.Model{ID: paymentMethod.ID}}, updates, selectCols...)
	}
	return paymentMethod, nil
}
