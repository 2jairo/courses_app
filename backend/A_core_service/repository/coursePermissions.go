package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"gorm.io/gorm/clause"
)

type CoursePermissionsRepository struct {
	Db *db.DatabasesConnection
}

func (self *CoursePermissionsRepository) Create(permission *entity.CoursePermissions) error {
	return self.Db.Pg.
		Clauses(clause.OnConflict{UpdateAll: true}).
		Create(permission).
		Error
}

func (self *CoursePermissionsRepository) FindOne(findBy *entity.CoursePermissions, preload entity.CoursePermissionsPreloadOptions) error {
	query := self.Db.Pg.Model(&entity.CoursePermissions{}).
		Where(findBy)

	preload.Preload(query, "")

	return query.First(findBy).Error
}

func (self *CoursePermissionsRepository) Find(findBy *entity.CoursePermissions, preload entity.CoursePermissionsPreloadOptions) ([]entity.CoursePermissions, error) {
	rows := []entity.CoursePermissions{}

	query := self.Db.Pg.Model(&entity.CoursePermissions{}).
		Where(findBy)

	preload.Preload(query, "")

	err := query.Find(&rows).Error
	return rows, err
}
