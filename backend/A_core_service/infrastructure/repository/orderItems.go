package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
)

type OrderItemRepository struct {
	Db *db.DatabasesConnection
}

func (r *OrderItemRepository) Create(orderItem *entity.OrderItem) error {
	return r.Db.Pg.Create(orderItem).Error
}

func (r *OrderItemRepository) CreateBatch(orderItems []entity.OrderItem) error {
	return r.Db.Pg.Create(orderItems).Error
}

func (self *OrderItemRepository) Update(updateBy *entity.OrderItem, orderItem *entity.OrderItem) error {
	return self.Db.Pg.
		Model(orderItem).
		Where(updateBy).
		Updates(orderItem).
		Error
}

func (r *OrderItemRepository) FindOne(findBy *entity.OrderItem, preload entity.OrderItemPreloadOptions) error {
	query := r.Db.Pg.Model(&entity.OrderItem{}).Where(findBy)
	preload.Preload(query, "")
	return query.First(findBy).Error
}

func (r *OrderItemRepository) Find(
	findBy *entity.OrderItem,
	preload entity.OrderItemPreloadOptions,
	pagination *utils.Pagination,
) ([]entity.OrderItem, error) {
	rows := []entity.OrderItem{}
	query := r.Db.Pg.Model(&entity.OrderItem{}).Where(findBy)

	preload.Preload(query, "")

	if pagination != nil {
		query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}

	err := query.Find(&rows).Error
	return rows, global.Err(err)
}

func (r *OrderItemRepository) Delete(deleteBy *entity.OrderItem) error {
	return r.Db.Pg.
		Where(deleteBy).
		Delete(&entity.OrderItem{}).
		Error
}
