package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type UserRepository struct {
	Db *db.DatabasesConnection
}

func (self *UserRepository) FindOne(findBy *entity.User) error {
	query := self.Db.Pg.Model(&entity.User{}).
		Where(findBy)

	return query.First(findBy).Error
}
