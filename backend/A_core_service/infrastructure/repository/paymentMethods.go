package repository

import (
	"context"

	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
	"github.com/stripe/stripe-go/v84"
	"gorm.io/gorm/clause"
)

type PaymentMethodRepository struct {
	Db *db.DatabasesConnection
}

func (r *PaymentMethodRepository) CreateSetupIntent(customerId string) (*stripe.SetupIntent, error) {
	params := &stripe.SetupIntentCreateParams{
		Customer: &customerId,
	}

	return r.Db.Stripe.V1SetupIntents.Create(context.TODO(), params)
}

func (r *PaymentMethodRepository) FinishSetupIntent(customerId string, setupIntentId string) (*stripe.PaymentMethod, error) {
	si, err := r.Db.Stripe.V1SetupIntents.Retrieve(context.TODO(), setupIntentId, nil)
	if err != nil {
		return nil, global.Err(err)
	}

	params := &stripe.PaymentMethodAttachParams{
		Customer: &customerId,
	}
	return r.Db.Stripe.V1PaymentMethods.Attach(context.TODO(), si.PaymentMethod.ID, params)
}

func (r *PaymentMethodRepository) DetachStripePaymentMethod(paymentMethodID string) (*stripe.PaymentMethod, error) {
	return r.Db.Stripe.V1PaymentMethods.Detach(context.TODO(), paymentMethodID, nil)
}

func (r *PaymentMethodRepository) UpdateStripePaymentMethod(paymentMethodID string, params *stripe.PaymentMethodUpdateParams) (*stripe.PaymentMethod, error) {
	return r.Db.Stripe.V1PaymentMethods.Update(context.TODO(), paymentMethodID, params)
}

func (r *PaymentMethodRepository) GetStripePaymentMethod(paymentMethodID string) (*stripe.PaymentMethod, error) {
	return r.Db.Stripe.V1PaymentMethods.Retrieve(context.TODO(), paymentMethodID, nil)
}

func (r *PaymentMethodRepository) Create(paymentMethod *entity.PaymentMethod) error {
	return r.Db.Pg.Create(paymentMethod).Error
}

func (r *PaymentMethodRepository) FindOne(findBy *entity.PaymentMethod, preload entity.PaymentMethodPreloadOptions) error {
	query := r.Db.Pg.Model(&entity.PaymentMethod{}).Where(findBy)
	preload.Preload(query, "")
	return query.First(findBy).Error
}

func (r *PaymentMethodRepository) Find(
	findBy *entity.PaymentMethod,
	preload entity.PaymentMethodPreloadOptions,
	pagination *utils.Pagination,
) ([]entity.PaymentMethod, error) {
	rows := []entity.PaymentMethod{}
	query := r.Db.Pg.Model(&entity.PaymentMethod{}).Where(findBy)

	preload.Preload(query, "")

	if pagination != nil {
		query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}

	err := query.Find(&rows).Error
	return rows, global.Err(err)
}

func (r *PaymentMethodRepository) Update(updateBy *entity.PaymentMethod, paymentMethod *entity.PaymentMethod, selectColumns ...string) (*entity.PaymentMethod, error) {
	updated := *paymentMethod

	query := r.Db.Pg.
		Model(&updated).
		Where(updateBy).
		Clauses(clause.Returning{})

	if len(selectColumns) > 0 {
		query = query.Select(selectColumns)
	}

	result := query.Updates(&updated)

	if result.Error != nil {
		return nil, result.Error
	}
	if result.RowsAffected == 0 {
		return nil, &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}

	return &updated, nil
}

func (r *PaymentMethodRepository) Delete(deleteBy *entity.PaymentMethod) error {
	return r.Db.Pg.
		Where(deleteBy).
		Delete(&entity.PaymentMethod{}).
		Error
}
