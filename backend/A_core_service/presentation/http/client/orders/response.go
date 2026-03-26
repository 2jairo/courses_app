package orders

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

// Response Types
type OrderResponse struct {
	ID          int64                  `json:"id"`
	CreatedAt   time.Time              `json:"createdAt"`
	UpdatedAt   time.Time              `json:"updatedAt"`
	TotalAmount int32                  `json:"totalAmount"`
	Currency    string                 `json:"currency"`
	Status      entity.OrderStatus     `json:"status"`
	PaidAt      *time.Time             `json:"paidAt"`
	CancelledAt *time.Time             `json:"cancelledAt"`
	Items       []OrderItemResponse    `json:"items"`
	Payments    []OrderPaymentResponse `json:"payments"`
}

type OrderItemResponse struct {
	ID                     int64                              `json:"id"`
	Quantity               int32                              `json:"quantity"`
	UnitPrice              int32                              `json:"unitPrice"`
	DiscountPercentPerUnit int32                              `json:"discountPercentPerUnit"`
	TotalPrice             int32                              `json:"totalPrice"`
	Destination            entity.ShoppingCartItemDestination `json:"destination"`
	Course                 OrderItemCourseResponse            `json:"course"`
}

type OrderItemCourseResponse struct {
	ID          int64   `json:"id"`
	Title       string  `json:"title"`
	Slug        string  `json:"slug"`
	Description string  `json:"description"`
	Price       int32   `json:"price"`
	Poster      *string `json:"poster"`
}

type OrderPaymentResponse struct {
	UpdatedAt      time.Time                   `json:"updatedAt"`
	Provider       entity.PaymentProvider      `json:"provider"`
	Amount         int32                       `json:"amount"`
	Currency       string                      `json:"currency"`
	Status         entity.PaymentStatus        `json:"status"`
	ErrorMessage   *string                     `json:"errorMessage"`
	RefundedAmount int32                       `json:"refundedAmount"`
	PaymentMethod  *OrderPaymentMethodResponse `json:"paymentMethod"`
}

type OrderPaymentMethodResponse struct {
	ID             int64                  `json:"id"`
	CreatedAt      time.Time              `json:"createdAt"`
	UpdatedAt      time.Time              `json:"updatedAt"`
	Provider       entity.PaymentProvider `json:"provider"`
	MethodType     string                 `json:"methodType"` // Stripe payment method type, such as card, paypal, or sepa_debit.
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

func (req *GetUserOrdersRequest) getResponse(orders []entity.Order) []OrderResponse {
	responses := make([]OrderResponse, len(orders))

	for i, order := range orders {
		items := make([]OrderItemResponse, len(order.Items))
		payments := make([]OrderPaymentResponse, len(order.Payments))

		for j, item := range order.Items {
			var poster *string = nil
			if item.Course.Poster != nil {
				poster = utils.Ref(item.Course.Poster.CdnImageUrl())
			}

			items[j] = OrderItemResponse{
				ID:                     int64(item.ID),
				Quantity:               item.Quantity,
				UnitPrice:              item.UnitPrice,
				DiscountPercentPerUnit: item.DiscountPercentPerUnit,
				TotalPrice:             item.TotalPrice,
				Destination:            item.Destination,
				Course: OrderItemCourseResponse{
					ID:          int64(item.Course.ID),
					Title:       item.Course.Title,
					Slug:        item.Course.Slug.Slug,
					Description: item.Course.Description,
					Price:       item.Course.Price,
					Poster:      poster,
				},
			}
		}

		for j, payment := range order.Payments {
			var paymentMethod *OrderPaymentMethodResponse = nil

			if payment.PaymentMethodID != nil {
				paymentMethod = &OrderPaymentMethodResponse{
					ID:             int64(payment.PaymentMethod.ID),
					CreatedAt:      payment.PaymentMethod.CreatedAt,
					UpdatedAt:      payment.PaymentMethod.UpdatedAt,
					Provider:       payment.PaymentMethod.Provider,
					MethodType:     payment.PaymentMethod.MethodType,
					LastFour:       payment.PaymentMethod.LastFour,
					ExpiryMonth:    payment.PaymentMethod.ExpiryMonth,
					ExpiryYear:     payment.PaymentMethod.ExpiryYear,
					CardholderName: payment.PaymentMethod.CardholderName,
					CardBrand:      payment.PaymentMethod.CardBrand,
					CardFunding:    payment.PaymentMethod.CardFunding,
					Email:          payment.PaymentMethod.Email,
					BankName:       payment.PaymentMethod.BankName,
					BankCode:       payment.PaymentMethod.BankCode,
					AccountType:    payment.PaymentMethod.AccountType,
					Country:        payment.PaymentMethod.Country,
					IsDefault:      payment.PaymentMethod.IsDefault,
				}
			}

			payments[j] = OrderPaymentResponse{
				UpdatedAt:      payment.UpdatedAt,
				Provider:       payment.Provider,
				Amount:         payment.Amount,
				Currency:       payment.Currency,
				Status:         payment.Status,
				ErrorMessage:   payment.ErrorMessage,
				RefundedAmount: payment.RefundedAmount,
				PaymentMethod:  paymentMethod,
			}
		}

		responses[i] = OrderResponse{
			ID:          int64(order.ID),
			CreatedAt:   order.CreatedAt,
			UpdatedAt:   order.UpdatedAt,
			TotalAmount: order.TotalAmount,
			Currency:    order.Currency,
			Status:      order.Status,
			PaidAt:      order.PaidAt,
			CancelledAt: order.CancelledAt,
			Items:       items,
			Payments:    payments,
		}
	}

	return responses
}
