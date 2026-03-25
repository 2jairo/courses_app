package repository

import (
	"context"
	"strconv"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/stripe/stripe-go/v84"
)

type PaymentRepository struct {
	Db *db.DatabasesConnection
}

func (self *PaymentRepository) CreateStripePaymentIntent(
	totalAmmount int64,
	totalDiscount int64,
	orderId int64,
	customerId string,
	paymentMethodId *string,
	savePaymentMethod bool,
) (*stripe.PaymentIntent, error) {
	orderIdString := strconv.FormatInt(orderId, 10)

	common := &stripe.PaymentIntentCreateParams{
		Amount: stripe.Int64(totalAmmount - totalDiscount),
		AmountDetails: &stripe.PaymentIntentCreateAmountDetailsParams{
			DiscountAmount: &totalDiscount,
		},
		Customer: &customerId,
		Currency: &config.TmpCurrency,
		Metadata: map[string]string{
			"orderId": orderIdString,
		},
		Params: stripe.Params{
			IdempotencyKey: &orderIdString,
		},
	}

	// paymentMethodId has priority over savePaymentMethod
	if paymentMethodId != nil {
		// prev created method
		common.PaymentMethod = paymentMethodId
		common.Confirm = stripe.Bool(true)
		common.OffSession = stripe.Bool(true)
		common.ReturnURL = stripe.String("http://localhost:5173/checkout")
	} else if savePaymentMethod {
		// new method && save
		common.SetupFutureUsage = stripe.String(stripe.PaymentIntentSetupFutureUsageOffSession)
	}

	return self.Db.Stripe.V1PaymentIntents.Create(context.TODO(), common)
}

func (r *PaymentRepository) Create(payment *entity.Payment) error {
	return r.Db.Pg.Create(payment).Error
}

func (self *PaymentRepository) Update(updateBy *entity.Payment, payment *entity.Payment) error {
	return self.Db.Pg.
		Model(payment).
		Where(updateBy).
		Updates(payment).
		Error
}

func (r *PaymentRepository) FindOne(findBy *entity.Payment, preload entity.PaymentPreloadOptions) error {
	query := r.Db.Pg.Model(&entity.Payment{}).Where(findBy)
	preload.Preload(query, "")
	return query.First(findBy).Error
}

func (r *PaymentRepository) Find(
	findBy *entity.Payment,
	preload entity.PaymentPreloadOptions,
	pagination *utils.Pagination,
) ([]entity.Payment, error) {
	var payments []entity.Payment
	query := r.Db.Pg.Model(&entity.Payment{}).Where(findBy)
	if pagination != nil {
		query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}
	preload.Preload(query, "")
	err := query.Find(&payments).Error
	return payments, err
}

func (r *PaymentRepository) Count(findBy *entity.Payment) (int64, error) {
	var count int64
	err := r.Db.Pg.Model(&entity.Payment{}).Where(findBy).Count(&count).Error
	return count, err
}

func (r *PaymentRepository) FindById(id int64, preload entity.PaymentPreloadOptions) (*entity.Payment, error) {
	payment := &entity.Payment{Model: entitycommon.Model{ID: entitycommon.Id(id)}}
	err := r.FindOne(payment, preload)
	return payment, err
}
