package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type CourseSectionRepository struct {
	Db *db.DatabasesConnection
}

func (self *CourseSectionRepository) FindOne(findBy *entity.CourseSection, preload entity.CourseSectionPreloadOptions) error {
	query := self.Db.Pg.Model(&entity.CourseSection{}).
		Where(findBy)

	preload.Preload(query, "")

	return query.First(findBy).Error
}

func (self *CourseSectionRepository) Create(course *entity.CourseSection) error {
	return self.Db.Pg.Create(course).Error
}

func (self *CourseSectionRepository) Delete(deleteBy *entity.CourseSection) error {
	return self.Db.Pg.
		Model(&entity.CourseSection{}).
		Where(deleteBy).
		Delete(deleteBy).
		Error
}
