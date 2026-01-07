package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm/clause"
)

type CourseRepository struct {
	Db *db.DatabasesConnection
}

func (self *CourseRepository) Create(course *entity.Course) error {
	return self.Db.Pg.Create(course).Error
}

func (self *CourseRepository) Delete(course *entity.Course) error {
	return self.Db.Pg.Delete(course).Error
}

func (r *CourseRepository) Update(updateBy *entity.Course, course *entity.Course) (*entity.Course, error) {
	updated := *course //TODO? deep clone

	result := r.Db.Pg.
		Model(&updated).
		Where(updateBy).
		Clauses(clause.Returning{}).
		Updates(&updated)

	if result.Error != nil {
		return nil, result.Error
	}
	if result.RowsAffected == 0 {
		return nil, &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}

	return &updated, nil
}
