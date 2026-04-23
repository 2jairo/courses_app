package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"gorm.io/gorm/clause"
)

type OrderRepository struct {
	Db *db.DatabasesConnection
}

func (r *OrderRepository) Create(order *entity.Order) error {
	return r.Db.Pg.Create(order).Error
}

func (self *OrderRepository) Update(updateBy *entity.Order, order *entity.Order) error {
	return self.Db.Pg.
		Model(&entity.Order{}).
		Where(updateBy).
		Omit(clause.Associations).
		Updates(order).
		Error
}

func (r *OrderRepository) FindOne(findBy *entity.Order, preload entity.OrderPreloadOptions) error {
	query := r.Db.Pg.Model(&entity.Order{}).Where(findBy)
	preload.Preload(query, "")
	return query.First(findBy).Error
}

func (r *OrderRepository) Find(
	findBy *entity.Order,
	preload entity.OrderPreloadOptions,
	pagination *utils.Pagination,
) ([]entity.Order, error) {
	rows := []entity.Order{}
	query := r.Db.Pg.Model(&entity.Order{}).Where(findBy)

	preload.Preload(query, "")

	if pagination != nil {
		query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}

	query.Order("id DESC")
	err := query.Find(&rows).Error
	return rows, global.Err(err)
}

func (r *OrderRepository) Delete(deleteBy *entity.Order) error {
	return r.Db.Pg.
		Where(deleteBy).
		Delete(&entity.Order{}).
		Error
}
