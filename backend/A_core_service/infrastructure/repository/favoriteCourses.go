package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"gorm.io/gorm/clause"
)

type FavoriteCourseRepository struct {
	Db *db.DatabasesConnection
}

func (r *FavoriteCourseRepository) Create(fav *entity.FavoriteCourse) error {
	return r.Db.Pg.
		Clauses(clause.OnConflict{UpdateAll: true}).
		Create(fav).
		Error
}

func (r *FavoriteCourseRepository) FindOne(findBy *entity.FavoriteCourse, preload entity.FavoriteCoursePreloadOptions) error {
	query := r.Db.Pg.Model(&entity.FavoriteCourse{}).Where(findBy)
	preload.Preload(query, "")
	return query.First(findBy).Error
}

func (r *FavoriteCourseRepository) Find(
	findBy *entity.FavoriteCourse,
	preload entity.FavoriteCoursePreloadOptions,
	pagination *utils.Pagination,
) ([]entity.FavoriteCourse, error) {
	rows := []entity.FavoriteCourse{}
	query := r.Db.Pg.Model(&entity.FavoriteCourse{}).Where(findBy)
	preload.Preload(query, "")
	if pagination != nil {
		query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}
	err := query.Find(&rows).Error
	return rows, err
}

func (r *FavoriteCourseRepository) Delete(deleteBy *entity.FavoriteCourse) error {
	return r.Db.Pg.
		Where(deleteBy).
		Delete(&entity.FavoriteCourse{}).
		Error
}
