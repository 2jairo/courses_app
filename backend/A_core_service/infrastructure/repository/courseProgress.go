package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"gorm.io/gorm/clause"
)

type CourseProgressRepository struct {
	Db *db.DatabasesConnection
}

func (r *CourseProgressRepository) FindOne(findBy *entity.CourseProgress) error {
	query := r.Db.Pg.Model(&entity.CourseProgress{}).
		Where(findBy)
	return query.First(findBy).Error
}

func (r *CourseProgressRepository) Find(findBy *entity.CourseProgress) ([]entity.CourseProgress, error) {
	rows := []entity.CourseProgress{}
	query := r.Db.Pg.Model(&entity.CourseProgress{}).Where(findBy)

	err := query.Find(&rows).Error
	return rows, err
}

func (r *CourseProgressRepository) Create(progress *entity.CourseProgress) error {
	return r.Db.Pg.
		Clauses(clause.OnConflict{UpdateAll: true}).
		Create(progress).
		Error
}

func (r *CourseProgressRepository) Delete(deleteBy *entity.CourseProgress) error {
	return r.Db.Pg.
		Where(deleteBy).
		Delete(&entity.CourseProgress{}).
		Error
}
