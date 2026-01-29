package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"gorm.io/gorm/clause"
)

type UserRepository struct {
	Db *db.DatabasesConnection
}

func (self *UserRepository) FindOne(findBy *entity.User) error {
	query := self.Db.Pg.Model(&entity.User{}).
		Where(findBy)

	return query.First(findBy).Error
}

func (self *UserRepository) FindIn(usernames []string) ([]entity.User, error) {
	users := []entity.User{}

	values := make([]interface{}, len(usernames))
	for i, v := range usernames {
		values[i] = v
	}

	query := self.Db.Pg.Model(&entity.User{}).
		Where(clause.IN{
			Column: "username",
			Values: values,
		})

	err := query.Find(&users).Error
	return users, err
}
