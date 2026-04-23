package payments

import (
	"encoding/json"
	"errors"
	"strconv"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
	"github.com/stripe/stripe-go/v84"
	"gorm.io/gorm"
)

type PaymentsService struct {
	Repo *infrastructure.AppRepositories
}

func (self *PaymentsService) CreatePaymentIntent(input CreatePaymentIntentInput) (*CreatePaymentIntentOutput, error) {
	user := &entity.User{Model: entitycommon.Model{ID: input.UserID}}
	if err := self.Repo.User.FindOne(user); err != nil {
		return nil, global.Err(err)
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
		return nil, global.Err(err)
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
			return nil, global.Err(err)
		}

		// 3. Order items
		orderItems := make([]entity.OrderItem, len(shoppingCart.Items))
		for i, item := range shoppingCart.Items {
			orderItems[i] = entity.OrderItem{
				OrderID:                order.ID,
				CourseID:               item.Course.ID,
				Quantity:               item.Quantity,
				UnitPrice:              item.Course.Price,
				DiscountPercentPerUnit: item.Course.DiscountPercent,
				TotalPrice:             item.Quantity * item.Course.DiscountedPrice(),
				Destination:            item.Destination,
			}
		}
		if err := repo.OrderItem.CreateBatch(orderItems); err != nil {
			return nil, global.Err(err)
		}

		var paymentMethodToken *string = nil
		var paymentMethodID *entitycommon.Id = nil
		if input.PaymentMethodId != nil {
			paymentMethod := &entity.PaymentMethod{Model: entitycommon.Model{ID: *input.PaymentMethodId}}
			if err := repo.PaymentMethod.FindOne(paymentMethod, entity.PaymentMethodPreloadOptions{}); err != nil {
				return nil, global.Err(err)
			}

			paymentMethodToken = &paymentMethod.Token
			paymentMethodID = &paymentMethod.ID
		}

		// 4.- Payment
		stripePi, err := repo.Payment.CreateStripePaymentIntent(
			int64(totalAmmount),
			int64(totalDiscount),
			int64(order.ID),
			user.StripeId,
			paymentMethodToken,
			input.SavePaymentMethod,
		)
		if err != nil {
			return nil, global.Err(err)
		}

		payment := &entity.Payment{
			OrderID:               order.ID,
			Amount:                totalAmmount - totalDiscount,
			Currency:              config.TmpCurrency,
			ProviderTransactionID: &stripePi.ID,
			Provider:              entity.PaymentProviderStripe,
			PaymentMethodID:       paymentMethodID,
		}
		if err := repo.Payment.Create(payment); err != nil {
			return nil, global.Err(err)
		}

		order.Items = orderItems
		return &CreatePaymentIntentOutput{Order: order, Payment: payment, StripePaymentIntent: stripePi}, nil
	})
	if err != nil {
		return nil, global.Err(err)
	}

	return resp.(*CreatePaymentIntentOutput), global.Err(err)
}

func (self *PaymentsService) AddCourseToLibrary(input AddCourseToLibraryInput) (*entity.CoursePurchase, error) {
	resp, err := self.Repo.BeginPgTxCallback(func(repo *infrastructure.AppRepositories) (any, error) {
		course := &entity.Course{Model: entitycommon.Model{ID: input.CourseID}}
		if err := repo.Course.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
			return nil, global.Err(err)
		}

		if course.DiscountedPrice() != 0 {
			return nil, &localerror.LocalError{Err: localerror.ErrKindForbidden, Status: fiber.StatusForbidden}
		}

		coursePurchase := &entity.CoursePurchase{UserID: input.UserID, CourseID: input.CourseID}
		if err := repo.CoursePurchase.FindOne(coursePurchase, entity.CoursePurchasePreloadOptions{}); err == nil {
			return nil, &localerror.LocalError{Err: localerror.ErrKindAlredyPurchased, Status: fiber.StatusConflict}
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, global.Err(err)
		}

		if err := self.createCoursePurchaseAndAnalytics(repo, input.UserID, input.CourseID); err != nil {
			return nil, global.Err(err)
		}

		return coursePurchase, nil
	})
	if err != nil {
		return nil, global.Err(err)
	}

	return resp.(*entity.CoursePurchase), nil
}

func (self *PaymentsService) createCoursePurchaseAndAnalytics(repo *infrastructure.AppRepositories, userID entitycommon.Id, courseID entitycommon.Id) error {
	coursePurchase := &entity.CoursePurchase{
		UserID:   userID,
		CourseID: courseID,
	}
	if err := repo.CoursePurchase.Create(coursePurchase); err != nil {
		return global.Err(err)
	}

	purchaseAnalytics := &analytics.CoursePurchasesRaw{
		UserID:   userID,
		CourseID: courseID,
	}
	if err := repo.Analytics.Create(&analytics.CoursePurchasesRaw{}, purchaseAnalytics); err != nil {
		return global.Err(err)
	}

	return nil
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
		return global.Err(err)
	}

	_, err := self.Repo.BeginPgTxCallback(func(repo *infrastructure.AppRepositories) (any, error) {
		// 1.- Payment
		payment := &entity.Payment{ProviderTransactionID: &pi.ID}
		if err := repo.Payment.FindOne(payment, entity.PaymentPreloadOptions{}); err != nil {
			return nil, global.Err(err)
		}

		payment.Status = entity.PaymentStatusSucceeded
		if err := repo.Payment.Update(
			&entity.Payment{Model: entitycommon.Model{ID: payment.ID}},
			payment,
		); err != nil {
			return nil, global.Err(err)
		}

		// 2.- Order & items
		order := &entity.Order{Model: entitycommon.Model{ID: payment.OrderID}}
		if err := repo.Order.FindOne(order, entity.OrderPreloadOptions{Items: true}); err != nil {
			return nil, global.Err(err)
		}

		// 3 - Save payment method
		if pi.SetupFutureUsage == stripe.PaymentIntentSetupFutureUsageOffSession && pi.PaymentMethod != nil {
			exists := true
			pm := &entity.PaymentMethod{Token: pi.PaymentMethod.ID}
			if err := repo.PaymentMethod.FindOne(pm, entity.PaymentMethodPreloadOptions{}); err != nil {
				if errors.Is(gorm.ErrRecordNotFound, err) {
					exists = false
				} else {
					return nil, global.Err(err)
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

				if err := self.createCoursePurchaseAndAnalytics(repo, order.UserID, item.CourseID); err != nil {
					return nil, global.Err(err)
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
					return nil, global.Err(err)
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
			return nil, global.Err(err)
		}

		// 6. Archive shopping cart
		if err := repo.ShoppingCart.Delete(
			&entity.ShoppingCart{UserID: order.UserID},
		); err != nil {
			return nil, global.Err(err)
		}

		// 7. Notification
		notificationMetadata, _ := json.Marshal(&entity.NotificationTypeOrderStatusUpdatedMetadata{
			OrderID: orderUpdate.ID,
			Status:  orderUpdate.Status,
		})
		notification := &entity.Notification{
			UserID:           order.UserID,
			NotificationType: entity.NotificationTypeOrderStatusUpdated,
			Metadata:         notificationMetadata,
		}
		repo.Notification.Create(notification)

		return order, nil
	})

	return global.Err(err)
}

func (self *PaymentsService) handleWebhookEvent_PaymentIntentPaymentFailed(event *stripe.Event) error {
	var pi stripe.PaymentIntent
	if err := json.Unmarshal(event.Data.Raw, &pi); err != nil {
		return global.Err(err)
	}

	_, err := self.Repo.BeginPgTxCallback(func(repo *infrastructure.AppRepositories) (any, error) {
		// 1.- Payment
		payment := &entity.Payment{ProviderTransactionID: &pi.ID}
		if err := repo.Payment.FindOne(payment, entity.PaymentPreloadOptions{}); err != nil {
			return nil, global.Err(err)
		}

		payment.Status = entity.PaymentStatusFailed
		if err := repo.Payment.Update(
			&entity.Payment{Model: entitycommon.Model{ID: payment.ID}},
			payment,
		); err != nil {
			return nil, global.Err(err)
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
			return nil, global.Err(err)
		}

		return nil, nil
	})

	return global.Err(err)
}

func (self *PaymentsService) handleWebhookEvent_PaymentIntentCanceled(event *stripe.Event) error {
	var pi stripe.PaymentIntent
	if err := json.Unmarshal(event.Data.Raw, &pi); err != nil {
		return global.Err(err)
	}

	_, err := self.Repo.BeginPgTxCallback(func(repo *infrastructure.AppRepositories) (any, error) {
		// 1.- Payment
		payment := &entity.Payment{ProviderTransactionID: &pi.ID}
		if err := repo.Payment.FindOne(payment, entity.PaymentPreloadOptions{}); err != nil {
			return nil, global.Err(err)
		}

		payment.Status = entity.PaymentStatusFailed
		if err := repo.Payment.Update(
			&entity.Payment{Model: entitycommon.Model{ID: payment.ID}},
			payment,
		); err != nil {
			return nil, global.Err(err)
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
			return nil, global.Err(err)
		}

		return nil, nil
	})

	return global.Err(err)
}

func (self *PaymentsService) handleWebhookEvent_SetupIntentSucceeded(event *stripe.Event) error {
	var si stripe.SetupIntent
	if err := json.Unmarshal(event.Data.Raw, &si); err != nil {
		return global.Err(err)
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
			return global.Err(err)
		}
	}

	if !exists {
		user := &entity.User{StripeId: si.Customer.ID}
		if err := self.Repo.User.FindOne(user); err != nil {
			return global.Err(err)
		}

		stripePaymentMethod, err := self.Repo.PaymentMethod.GetStripePaymentMethod(si.PaymentMethod.ID)
		if err == nil && stripePaymentMethod != nil {
			paymentMethod := entity.PaymentMethodFromStripe(stripePaymentMethod, user.ID, false)
			self.Repo.PaymentMethod.Create(paymentMethod)
		}
	}

	return nil
}
