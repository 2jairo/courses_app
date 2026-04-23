package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"gorm.io/gorm/clause"
)

type CourseTagsRepository struct {
	Db *db.DatabasesConnection
}

func (self *CourseTagsRepository) FindOne(findBy *entity.CourseTag, preload entity.CourseTagPreloadOptions) error {
	query := self.Db.Pg.Model(&entity.CourseTag{}).
		Where(findBy)

	preload.Preload(query, "")

	return query.First(findBy).Error
}

func (r *CourseTagsRepository) Find(
	findBy *entity.CourseTag,
	preload entity.CourseTagPreloadOptions,
	pagination *utils.Pagination,
) ([]entity.CourseTag, error) {
	rows := []entity.CourseTag{}
	query := r.Db.Pg.Model(&entity.CourseTag{}).Where(findBy)

	preload.Preload(query, "")

	if pagination != nil {
		query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}

	err := query.Find(&rows).Error
	return rows, global.Err(err)
}

func (self *CourseTagsRepository) Create(tag *entity.CourseTag) error {
	return self.Db.Pg.
		Clauses(clause.OnConflict{DoNothing: true}).
		Create(tag).
		Error
}

func (self *CourseTagsRepository) CreateBatch(tags []entity.CourseTag) error {
	return self.Db.Pg.
		Clauses(clause.OnConflict{DoNothing: true}).
		Create(tags).
		Error
}

func (self *CourseTagsRepository) Delete(deleteBy *entity.CourseTag) error {
	return self.Db.Pg.
		Model(&entity.CourseTag{}).
		Where(deleteBy).
		Delete(deleteBy).
		Error
}

func (self *CourseTagsRepository) UpdateOne(updateBy *entity.CourseTag, lectureVideo *entity.CourseTag) error {
	return self.Db.Pg.
		Model(&entity.CourseTag{}).
		Clauses(clause.Returning{}).
		Where(updateBy).
		Updates(lectureVideo).
		Error
}
