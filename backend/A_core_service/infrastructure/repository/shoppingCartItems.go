package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"gorm.io/gorm/clause"
)

type ShoppingCartItemRepository struct {
	Db *db.DatabasesConnection
}

func (r *ShoppingCartItemRepository) Create(item *entity.ShoppingCartItem) error {
	return r.Db.Pg.
		Clauses(clause.OnConflict{UpdateAll: true}).
		Create(item).
		Error
}

func (self *ShoppingCartItemRepository) Update(updateBy *entity.ShoppingCartItem, item *entity.ShoppingCartItem) error {
	return self.Db.Pg.
		Model(item).
		Where(updateBy).
		Updates(item).
		Error
}

func (r *ShoppingCartItemRepository) FindOne(findBy *entity.ShoppingCartItem, preload entity.ShoppingCartItemPreloadOptions) error {
	query := r.Db.Pg.Model(&entity.ShoppingCartItem{}).Where(findBy)
	preload.Preload(query, "")
	return query.First(findBy).Error
}

func (r *ShoppingCartItemRepository) Find(
	findBy *entity.ShoppingCartItem,
	preload entity.ShoppingCartItemPreloadOptions,
	pagination *utils.Pagination,
) ([]entity.ShoppingCartItem, error) {
	rows := []entity.ShoppingCartItem{}
	query := r.Db.Pg.Model(&entity.ShoppingCartItem{}).Where(findBy)
	preload.Preload(query, "")
	if pagination != nil {
		query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}
	err := query.Find(&rows).Error
	return rows, err
}

func (r *ShoppingCartItemRepository) Delete(deleteBy *entity.ShoppingCartItem) error {
	return r.Db.Pg.
		Where(deleteBy).
		Delete(&entity.ShoppingCartItem{}).
		Error
}
