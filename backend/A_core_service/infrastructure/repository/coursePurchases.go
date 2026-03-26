package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"gorm.io/gorm/clause"
)

type CoursePurchaseRepository struct {
	Db *db.DatabasesConnection
}

func (r *CoursePurchaseRepository) Create(purchase *entity.CoursePurchase) error {
	return r.Db.Pg.
		Clauses(clause.OnConflict{UpdateAll: true}).
		Create(purchase).
		Error
}

func (r *CoursePurchaseRepository) FindOne(findBy *entity.CoursePurchase, preload entity.CoursePurchasePreloadOptions) error {
	query := r.Db.Pg.Model(&entity.CoursePurchase{}).Where(findBy)
	preload.Preload(query, "")
	return query.First(findBy).Error
}

func (r *CoursePurchaseRepository) Find(
	findBy *entity.CoursePurchase,
	preload entity.CoursePurchasePreloadOptions,
	pagination *utils.Pagination,
) ([]entity.CoursePurchase, error) {
	rows := []entity.CoursePurchase{}
	query := r.Db.Pg.Model(&entity.CoursePurchase{}).Where(findBy)

	preload.Preload(query, "")

	if pagination != nil {
		query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}

	err := query.Find(&rows).Error
	return rows, err
}

func (r *CoursePurchaseRepository) Delete(deleteBy *entity.CoursePurchase) error {
	return r.Db.Pg.
		Where(deleteBy).
		Delete(&entity.CoursePurchase{}).
		Error
}
