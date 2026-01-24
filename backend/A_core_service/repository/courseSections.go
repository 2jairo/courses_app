package repository

import (
	"fmt"
	"strings"

	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
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

func (self *CourseSectionRepository) Update(updateBy *entity.CourseSection, courseSection *entity.CourseSection) (*entity.CourseSection, error) {
	updated := *courseSection
	result := self.Db.Pg.
		Model(&updated).
		Where(updateBy).
		Updates(&updated)

	if result.Error != nil {
		return nil, result.Error
	}

	return &updated, nil
}

func (self *CourseSectionRepository) UpdatePositions(positions []utils.Positions) error {
	if len(positions) == 0 {
		return nil
	}

	// Build VALUES clause
	values := make([]string, len(positions))
	args := make([]interface{}, 0, len(positions)*2)

	for i, p := range positions {
		values[i] = fmt.Sprintf("($%d::bigint, $%d::int)", i*2+1, i*2+2)
		args = append(args, p.ID, p.Position)
	}

	query := fmt.Sprintf(`
		UPDATE course_sections cs
		SET position = v.position
		FROM (
			VALUES %s
		) AS v(id, position)
		WHERE cs.id = v.id
	`, strings.Join(values, ","))

	return self.Db.Pg.Exec(query, args...).Error
}
