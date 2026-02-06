package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"gorm.io/gorm/clause"
)

type LectureVideoRepository struct {
	Db *db.DatabasesConnection
}

func (self *LectureVideoRepository) FindOne(findBy *entity.LectureVideo, preload entity.LectureVideoPreloadOptions) error {
	query := self.Db.Pg.Model(&entity.LectureVideo{}).
		Where(findBy)

	preload.Preload(query, "")

	return query.First(findBy).Error
}

func (self *LectureVideoRepository) Create(lecture *entity.LectureVideo, prelaod entity.LectureVideoPreloadOptions) error {
	query := self.Db.Pg.Model(&entity.LectureVideo{})
	prelaod.Preload(query, "")

	return query.Create(lecture).First(lecture).Error
}

func (self *LectureVideoRepository) Delete(deleteBy *entity.LectureVideo) error {
	return self.Db.Pg.
		Model(&entity.LectureVideo{}).
		Where(deleteBy).
		Delete(deleteBy).
		Error
}

func (self *LectureVideoRepository) UpdateOne(updateBy *entity.LectureVideo, lectureVideo *entity.LectureVideo) error {
	return self.Db.Pg.
		Model(&entity.LectureVideo{}).
		Clauses(clause.Returning{}).
		Where(updateBy).
		Updates(lectureVideo).
		Error
}
