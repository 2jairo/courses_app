package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
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

func (self *CoursePermissionsRepository) Find(
	findBy *entity.CoursePermissions,
	preload entity.CoursePermissionsPreloadOptions,
	pagination *utils.Pagination,
) ([]entity.CoursePermissions, error) {
	rows := []entity.CoursePermissions{}

	query := self.Db.Pg.Model(&entity.CoursePermissions{}).
		Where(findBy)

	preload.Preload(query, "")

	if pagination != nil {
		query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}

	err := query.Find(&rows).Error
	return rows, err
}

func (self *CoursePermissionsRepository) Delete(deleteBy *entity.CoursePermissions) error {
	return self.Db.Pg.
		Model(&entity.CoursePermissions{}).
		Where(deleteBy).
		Delete(deleteBy).
		Error
}

func (self *CoursePermissionsRepository) FindCoursesWithPrefix(
	userID entitycommon.Id,
	preload entity.CoursePermissionsPreloadOptions,
	pagination *utils.Pagination,
	q string,
) ([]entity.CoursePermissions, error) {
	rows := []entity.CoursePermissions{}

	query := self.Db.Pg.Model(&entity.CoursePermissions{}).
		Where(&entity.CoursePermissions{UserID: userID}).
		Joins("Course").
		Order(`"Course"."created_at" DESC`)

	if len(q) > 0 {
		query = query.
			Where(clause.Like{
				Column: "Course.title",
				Value:  "%" + q + "%",
			})
	}

	preload.Preload(query, "")

	if pagination != nil {
		query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}

	err := query.Find(&rows).Error
	return rows, err
}
