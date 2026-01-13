package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type LectureRepository struct {
	Db *db.DatabasesConnection
}

func (self *LectureRepository) FindOne(findBy *entity.Lecture, preload entity.LecturePreloadOptions) error {
	query := self.Db.Pg.Model(&entity.Lecture{}).
		Where(findBy)

	preload.Preload(query, "")

	return query.First(findBy).Error
}

func (self *LectureRepository) Create(lecture *entity.Lecture, preload entity.LecturePreloadOptions) error {
	query := self.Db.Pg.Model(&entity.Lecture{})
	preload.Preload(query, "")

	return query.Create(lecture).First(lecture).Error

}

func (self *LectureRepository) Delete(deleteBy *entity.Lecture) error {
	return self.Db.Pg.
		Model(&entity.Lecture{}).
		Where(deleteBy).
		Delete(deleteBy).
		Error
}
