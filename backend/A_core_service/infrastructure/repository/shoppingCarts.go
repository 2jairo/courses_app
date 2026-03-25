package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type ShoppingCartRepository struct {
	Db *db.DatabasesConnection
}

func (r *ShoppingCartRepository) Create(cart *entity.ShoppingCart) error {
	return r.Db.Pg.Create(cart).Error
}

func (self *ShoppingCartRepository) Update(updateBy *entity.ShoppingCart, cart *entity.ShoppingCart) error {
	return self.Db.Pg.
		Model(cart).
		Where(updateBy).
		Updates(cart).
		Error
}

func (r *ShoppingCartRepository) FindOne(findBy *entity.ShoppingCart, preload entity.ShoppingCartPreloadOptions) error {
	query := r.Db.Pg.Model(&entity.ShoppingCart{}).Where(findBy)
	preload.Preload(query, "")
	return query.First(findBy).Error
}

func (r *ShoppingCartRepository) Find(
	findBy *entity.ShoppingCart,
	preload entity.ShoppingCartPreloadOptions,
	pagination *utils.Pagination,
) ([]entity.ShoppingCart, error) {
	rows := []entity.ShoppingCart{}
	query := r.Db.Pg.Model(&entity.ShoppingCart{}).Where(findBy)
	preload.Preload(query, "")
	if pagination != nil {
		query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}
	err := query.Find(&rows).Error
	return rows, err
}

func (r *ShoppingCartRepository) Delete(deleteBy *entity.ShoppingCart) error {
	return r.Db.Pg.
		Where(deleteBy).
		Delete(&entity.ShoppingCart{}).
		Error
}
