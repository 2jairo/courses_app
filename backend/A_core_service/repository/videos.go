package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"gorm.io/gorm"
)

type VideoRepository struct {
	pg *gorm.DB
}

func NewVideoRepository(pg *gorm.DB) VideoRepository {
	return VideoRepository{
		pg,
	}
}

func (self *VideoRepository) Create(video *entity.Video) error {
	return self.pg.Create(video).Error
}
