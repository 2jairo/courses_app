package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type CourseSectionRepository struct {
	Db *db.DatabasesConnection
}

func (self *CourseSectionRepository) Create(course *entity.CourseSection) error {
	return self.Db.Pg.Create(course).Error
}

func (self *CourseSectionRepository) Delete(course *entity.CourseSection) error {
	return self.Db.Pg.Delete(course).Error
}
