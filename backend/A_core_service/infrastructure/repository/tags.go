package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"gorm.io/gorm/clause"
)

type TagsRepository struct {
	Db *db.DatabasesConnection
}

func (self *TagsRepository) Create(tag *entity.Tag) error {
	return self.Db.Pg.
		Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "name"}},
			DoUpdates: clause.AssignmentColumns([]string{"slug", "deleted_at"}),
		}).
		Create(tag).
		Error
}

func (self *TagsRepository) CreateBatch(tags []entity.Tag) error {
	return self.Db.Pg.
		Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "name"}},
			DoUpdates: clause.AssignmentColumns([]string{"slug", "deleted_at"}),
		}).
		Create(tags).
		Error
}

func (self *TagsRepository) FindOne(findBy *entity.Tag, preload entity.TagPreloadOptions) error {
	query := self.Db.Pg.Model(&entity.Tag{}).Where(findBy)
	preload.Preload(query, "")
	return query.First(findBy).Error
}

func (self *TagsRepository) Find(
	findBy *entity.Tag,
	preload entity.TagPreloadOptions,
	pagination *utils.Pagination,
) ([]entity.Tag, error) {
	rows := []entity.Tag{}
	query := self.Db.Pg.Model(&entity.Tag{}).Where(findBy)
	preload.Preload(query, "")
	if pagination != nil {
		query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}
	err := query.Find(&rows).Error
	return rows, global.Err(err)
}

func (self *TagsRepository) FindTagsWithPrefix(
	preload entity.TagPreloadOptions,
	pagination *utils.Pagination,
	q string,
) ([]entity.Tag, error) {
	rows := []entity.Tag{}

	query := self.Db.Pg.Model(&entity.Tag{})

	if len(q) > 0 {
		query = query.Where(clause.Like{
			Column: "name",
			Value:  "%" + q + "%",
		})
	}

	preload.Preload(query, "")

	if pagination != nil {
		query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}

	err := query.Find(&rows).Error
	return rows, global.Err(err)
}

func (self *TagsRepository) Delete(deleteBy *entity.Tag) error {
	return self.Db.Pg.Where(deleteBy).Delete(&entity.Tag{}).Error
}
