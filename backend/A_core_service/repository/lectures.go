package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type LectureRepository struct {
	Db *db.DatabasesConnection
}

func (self *LectureRepository) Create(lecture *entity.Lecture, preload entity.LecturePreloadOptions) error {
	query := self.Db.Pg.Model(&entity.Lecture{})
	preload.Preload(query, "")

	return query.Create(lecture).First(lecture).Error

}
