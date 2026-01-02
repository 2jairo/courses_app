package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type VideoRepository struct {
	Db *db.DatabasesConnection
}

func (self *VideoRepository) Create(video *entity.Video) error {
	return self.Db.Pg.Create(video).Error
}
