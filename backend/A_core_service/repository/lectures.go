package repository

import (
	"fmt"
	"strings"

	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type LectureRepository struct {
	Db *db.DatabasesConnection
}

func (self *LectureRepository) FindOne(findBy *entity.Lecture, preload entity.LecturePreloadOptions) error {
	query := self.Db.Pg.Model(&entity.Lecture{}).
		Where(findBy)

	preload.Preload(query, "")

	return query.First(findBy).Error
}

func (self *LectureRepository) Create(lecture *entity.Lecture, preload entity.LecturePreloadOptions) error {
	query := self.Db.Pg.Model(&entity.Lecture{})
	preload.Preload(query, "")

	return query.Create(lecture).First(lecture).Error

}

func (self *LectureRepository) Delete(deleteBy *entity.Lecture) error {
	return self.Db.Pg.
		Model(&entity.Lecture{}).
		Where(deleteBy).
		Delete(deleteBy).
		Error
}

func (self *LectureRepository) Update(updateBy *entity.Lecture, lecture *entity.Lecture) (*entity.Lecture, error) {
	updated := *lecture
	result := self.Db.Pg.
		Model(&updated).
		Where(updateBy).
		Updates(&updated)

	if result.Error != nil {
		return nil, result.Error
	}

	return &updated, nil
}

func (self *LectureRepository) UpdatePositions(positions []utils.Positions) error {
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
		UPDATE lectures l
		SET position = v.position
		FROM (
			VALUES %s
		) AS v(id, position)
		WHERE l.id = v.id
	`, strings.Join(values, ","))

	return self.Db.Pg.Exec(query, args...).Error
}
