package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
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
