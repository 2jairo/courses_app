package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type LectureDocumentRepository struct {
	Db *db.DatabasesConnection
}

func (self *LectureDocumentRepository) FindOne(findBy *entity.LectureDocument, preload entity.LectureDocumentPreloadOptions) error {
	query := self.Db.Pg.Model(&entity.LectureDocument{}).
		Where(findBy)

	preload.Preload(query, "")

	return query.First(findBy).Error
}

func (self *LectureDocumentRepository) Create(lecture *entity.LectureDocument, preload entity.LectureDocumentPreloadOptions) error {
	query := self.Db.Pg.Model(&entity.LectureDocument{})
	preload.Preload(query, "")

	return query.Create(lecture).First(lecture).Error
}

func (self *LectureDocumentRepository) Delete(deleteBy *entity.LectureDocument) error {
	return self.Db.Pg.
		Model(&entity.LectureDocument{}).
		Where(deleteBy).
		Delete(deleteBy).
		Error
}
