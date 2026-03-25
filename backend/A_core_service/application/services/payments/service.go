package payments

import (
	"encoding/json"
	"errors"
	"strconv"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/stripe/stripe-go/v84"
	"gorm.io/gorm"
)

type PaymentsService struct {
	Repo *infrastructure.AppRepositories
}

func (self *PaymentsService) CreatePaymentIntent(input CreatePaymentIntentInput) (*CreatePaymentIntentOutput, error) {
	user := &entity.User{Model: entitycommon.Model{ID: input.UserID}}
	if err := self.Repo.User.FindOne(user); err != nil {
		return nil, err
	}

	shoppingCart := &entity.ShoppingCart{UserID: input.UserID}
	if err := self.Repo.ShoppingCart.FindOne(
		shoppingCart,
		entity.ShoppingCartPreloadOptions{
			Items: true,
			ShoppingCartItemPreloadOptions: entity.ShoppingCartItemPreloadOptions{
				Course: true,
			},
		},
	); err != nil {
		return nil, err
	}

	resp, err := self.Repo.BeginPgTxCallback(func(repo *infrastructure.AppRepositories) (any, error) {
		// 1. Create order
		totalAmmount := int32(0)
		totalDiscount := int32(0)
		for _, item := range shoppingCart.Items {
			totalPrice := item.Quantity * item.Course.Price
			discountedPrice := item.Quantity * item.Course.DiscountedPrice()

			totalAmmount += totalPrice
			totalDiscount += totalPrice - discountedPrice
		}

		order := &entity.Order{
			UserID:      input.UserID,
			TotalAmount: totalAmmount - totalDiscount,
			Currency:    config.TmpCurrency,
			Status:      entity.OrderStatusPending,
		}
		if err := repo.Order.Create(order); err != nil {
			return nil, err
		}

		// 3. Order items
		orderItems := make([]entity.OrderItem, len(shoppingCart.Items))
		for i, item := range shoppingCart.Items {
			orderItems[i] = entity.OrderItem{
				OrderID:     order.ID,
				CourseID:    item.Course.ID,
				Quantity:    item.Quantity,
				UnitPrice:   item.Course.DiscountedPrice(),
				TotalPrice:  item.Quantity * item.Course.DiscountedPrice(),
				Destination: item.Destination,
			}
		}
		if err := repo.OrderItem.CreateBatch(orderItems); err != nil {
			return nil, err
		}

		// 4.- Payment
		stripePi, err := repo.Payment.CreateStripePaymentIntent(
			int64(totalAmmount),
			int64(totalDiscount),
			int64(order.ID),
			user.StripeId,
			input.PaymentMethodId,
			input.SavePaymentMethod,
		)
		if err != nil {
			return nil, err
		}

		payment := &entity.Payment{
			OrderID:               order.ID,
			Amount:                totalAmmount - totalDiscount,
			Currency:              config.TmpCurrency,
			ProviderTransactionID: &stripePi.ID,
			Provider:              entity.PaymentProviderStripe,
			// PaymentMethodID: ,
		}
		if err := repo.Payment.Create(payment); err != nil {
			return nil, err
		}

		order.Items = orderItems
		return &CreatePaymentIntentOutput{Order: order, Payment: payment, StripePaymentIntent: stripePi}, nil
	})
	if err != nil {
		return nil, err
	}

	return resp.(*CreatePaymentIntentOutput), err
}

func (self *PaymentsService) HandleWebhookEvent(event *stripe.Event) error {
	switch event.Type {

	//TODO: notification
	case stripe.EventTypePaymentIntentSucceeded:
		return self.handleWebhookEvent_PaymentIntentSucceeded(event)

	case stripe.EventTypePaymentIntentPaymentFailed:
		return self.handleWebhookEvent_PaymentIntentPaymentFailed(event)

	case stripe.EventTypePaymentIntentCanceled:
		return self.handleWebhookEvent_PaymentIntentCanceled(event)

	case stripe.EventTypeSetupIntentSucceeded:
		return self.handleWebhookEvent_SetupIntentSucceeded(event)
	}

	return nil
}

func (self *PaymentsService) handleWebhookEvent_PaymentIntentSucceeded(event *stripe.Event) error {
	var pi stripe.PaymentIntent
	if err := json.Unmarshal(event.Data.Raw, &pi); err != nil {
		return err
	}

	_, err := self.Repo.BeginPgTxCallback(func(repo *infrastructure.AppRepositories) (any, error) {
		// 1.- Payment
		payment := &entity.Payment{ProviderTransactionID: &pi.ID}
		if err := repo.Payment.FindOne(payment, entity.PaymentPreloadOptions{}); err != nil {
			return nil, err
		}

		payment.Status = entity.PaymentStatusSucceeded
		if err := repo.Payment.Update(
			&entity.Payment{Model: entitycommon.Model{ID: payment.ID}},
			payment,
		); err != nil {
			return nil, err
		}

		// 2.- Order & items
		order := &entity.Order{Model: entitycommon.Model{ID: payment.OrderID}}
		if err := repo.Order.FindOne(order, entity.OrderPreloadOptions{Items: true}); err != nil {
			return nil, err
		}

		// 3 - Save payment method
		if pi.SetupFutureUsage == stripe.PaymentIntentSetupFutureUsageOffSession && pi.PaymentMethod != nil {
			exists := true
			pm := &entity.PaymentMethod{Token: pi.PaymentMethod.ID}
			if err := repo.PaymentMethod.FindOne(pm, entity.PaymentMethodPreloadOptions{}); err != nil {
				if errors.Is(gorm.ErrRecordNotFound, err) {
					exists = false
				} else {
					return nil, err
				}
			}

			if !exists {
				stripePaymentMethod, err := repo.PaymentMethod.GetStripePaymentMethod(pi.PaymentMethod.ID)
				if err == nil && stripePaymentMethod != nil {
					paymentMethod := entity.PaymentMethodFromStripe(stripePaymentMethod, order.UserID, false)
					repo.PaymentMethod.Create(paymentMethod)
				}
			}
		}

		// 4. Purchases
		for _, item := range order.Items {
			if item.Quantity <= 0 {
				continue
			}

			switch item.Destination {
			case entity.ShoppingCartItemDestinationCurrentUser:
				if item.Quantity > 1 {
					panic("Quantity can't be higher than 1 when destination is CurrentUser")
				}

				coursePurchase := &entity.CoursePurchase{
					UserID:   order.UserID,
					CourseID: item.CourseID,
				}
				if err := repo.CoursePurchase.Create(coursePurchase); err != nil {
					return nil, err
				}

			case entity.ShoppingCartItemDestinationGift:
				giftCodes := make([]entity.CourseGiftCode, item.Quantity)

				for i := 0; i < int(item.Quantity); i++ {
					giftCodes[i] = entity.CourseGiftCode{
						OrderID:  order.ID,
						CourseID: item.CourseID,
						Code: strconv.FormatInt(int64(item.OrderID), 10) +
							strconv.FormatInt(int64(item.CourseID), 10) +
							strconv.FormatInt(int64(i), 10) +
							utils.GenerateUUID(),
					}
				}

				if err := repo.CourseGiftCode.CreateBatch(giftCodes); err != nil {
					return nil, err
				}
			}
		}

		// 5. update order
		now := time.Now()
		orderUpdate := &entity.Order{
			Status: entity.OrderStatusPaid,
			PaidAt: &now,
		}
		if err := repo.Order.Update(
			&entity.Order{Model: entitycommon.Model{ID: order.ID}},
			orderUpdate,
		); err != nil {
			return nil, err
		}

		// 6. Archive shopping cart
		if err := repo.ShoppingCart.Delete(
			&entity.ShoppingCart{UserID: order.UserID},
		); err != nil {
			return nil, err
		}

		return nil, nil
	})

	return err
}

func (self *PaymentsService) handleWebhookEvent_PaymentIntentPaymentFailed(event *stripe.Event) error {
	var pi stripe.PaymentIntent
	if err := json.Unmarshal(event.Data.Raw, &pi); err != nil {
		return err
	}

	_, err := self.Repo.BeginPgTxCallback(func(repo *infrastructure.AppRepositories) (any, error) {
		// 1.- Payment
		payment := &entity.Payment{ProviderTransactionID: &pi.ID}
		if err := repo.Payment.FindOne(payment, entity.PaymentPreloadOptions{}); err != nil {
			return nil, err
		}

		payment.Status = entity.PaymentStatusFailed
		if err := repo.Payment.Update(
			&entity.Payment{Model: entitycommon.Model{ID: payment.ID}},
			payment,
		); err != nil {
			return nil, err
		}

		// 2.- Cancel Order
		now := time.Now()
		orderUpdate := &entity.Order{
			Status:      entity.OrderStatusCancelled,
			CancelledAt: &now,
		}
		if err := repo.Order.Update(
			&entity.Order{Model: entitycommon.Model{ID: payment.OrderID}},
			orderUpdate,
		); err != nil {
			return nil, err
		}

		return nil, nil
	})

	return err
}

func (self *PaymentsService) handleWebhookEvent_PaymentIntentCanceled(event *stripe.Event) error {
	var pi stripe.PaymentIntent
	if err := json.Unmarshal(event.Data.Raw, &pi); err != nil {
		return err
	}

	_, err := self.Repo.BeginPgTxCallback(func(repo *infrastructure.AppRepositories) (any, error) {
		// 1.- Payment
		payment := &entity.Payment{ProviderTransactionID: &pi.ID}
		if err := repo.Payment.FindOne(payment, entity.PaymentPreloadOptions{}); err != nil {
			return nil, err
		}

		payment.Status = entity.PaymentStatusFailed
		if err := repo.Payment.Update(
			&entity.Payment{Model: entitycommon.Model{ID: payment.ID}},
			payment,
		); err != nil {
			return nil, err
		}

		// 2.- Cancel Order
		now := time.Now()
		orderUpdate := &entity.Order{
			Status:      entity.OrderStatusCancelled,
			CancelledAt: &now,
		}
		if err := repo.Order.Update(
			&entity.Order{Model: entitycommon.Model{ID: payment.OrderID}},
			orderUpdate,
		); err != nil {
			return nil, err
		}

		return nil, nil
	})

	return err
}

func (self *PaymentsService) handleWebhookEvent_SetupIntentSucceeded(event *stripe.Event) error {
	var si stripe.SetupIntent
	if err := json.Unmarshal(event.Data.Raw, &si); err != nil {
		return err
	}
	if si.PaymentMethod == nil || si.Customer == nil {
		return nil
	}

	exists := true
	pm := &entity.PaymentMethod{Token: si.PaymentMethod.ID}
	if err := self.Repo.PaymentMethod.FindOne(pm, entity.PaymentMethodPreloadOptions{}); err != nil {
		if errors.Is(gorm.ErrRecordNotFound, err) {
			exists = false
		} else {
			return err
		}
	}

	if !exists {
		user := &entity.User{StripeId: si.Customer.ID}
		if err := self.Repo.User.FindOne(user); err != nil {
			return err
		}

		stripePaymentMethod, err := self.Repo.PaymentMethod.GetStripePaymentMethod(si.PaymentMethod.ID)
		if err == nil && stripePaymentMethod != nil {
			paymentMethod := entity.PaymentMethodFromStripe(stripePaymentMethod, user.ID, false)
			self.Repo.PaymentMethod.Create(paymentMethod)
		}
	}

	return nil
}
