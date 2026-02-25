package repository

import (
	"fmt"
	"strings"

	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type LectureQuizRepository struct {
	Db *db.DatabasesConnection
}

func (self *LectureQuizRepository) FindOne(findBy *entity.LectureQuiz, preload entity.LectureQuizPreloadOptions) error {
	query := self.Db.Pg.Model(&entity.LectureQuiz{})

	preload.Preload(query, "")

	return query.Where(findBy).First(findBy).Error
}

func (self *LectureQuizRepository) FindByCourse(courseId interface{}, preload entity.LectureQuizPreloadOptions, pagination *utils.Pagination, q string, sortOrder *utils.SortOrder, sortBy *entity.QuizSortBy) ([]entity.LectureQuiz, error) {
	rows := []entity.LectureQuiz{}

	query := self.Db.Pg.Model(&entity.LectureQuiz{}).
		Where("course_id = ?", courseId)

	preload.Preload(query, "")

	if len(q) > 0 {
		query = query.Where("title ILIKE ?", "%"+q+"%")
	}

	if sortBy != nil {
		order := utils.SortOrderAsc
		if sortOrder != nil {
			order = *sortOrder
		}
		query = query.Order(sortBy.Column() + " " + string(order))
	}

	if pagination != nil {
		query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}

	err := query.Find(&rows).Error
	return rows, err
}

func (self *LectureQuizRepository) Create(quiz *entity.LectureQuiz, preload entity.LectureQuizPreloadOptions) error {
	query := self.Db.Pg.Model(&entity.LectureQuiz{})
	preload.Preload(query, "")

	return query.Create(quiz).First(quiz).Error
}

func (self *LectureQuizRepository) Delete(deleteBy *entity.LectureQuiz) error {
	return self.Db.Pg.
		Model(&entity.LectureQuiz{}).
		Where(deleteBy).
		Delete(deleteBy).
		Error
}

func (self *LectureQuizRepository) Update(updateBy *entity.LectureQuiz, quiz *entity.LectureQuiz) (*entity.LectureQuiz, error) {
	updated := *quiz
	result := self.Db.Pg.
		Model(&updated).
		Where(updateBy).
		Updates(&updated)

	if result.Error != nil {
		return nil, result.Error
	}

	return &updated, nil
}

type QuizQuestionRepository struct {
	Db *db.DatabasesConnection
}

func (self *QuizQuestionRepository) FindOne(findBy *entity.QuizQuestion, preload entity.QuizQuestionPreloadOptions) error {
	query := self.Db.Pg.Model(&entity.QuizQuestion{}).
		Where(findBy)

	preload.Preload(query, "")

	return query.First(findBy).Error
}

func (self *QuizQuestionRepository) Find(findBy *entity.QuizQuestion, preload entity.QuizQuestionPreloadOptions) ([]entity.QuizQuestion, error) {
	rows := []entity.QuizQuestion{}

	query := self.Db.Pg.Model(&entity.QuizQuestion{}).
		Where(findBy)

	preload.Preload(query, "")

	err := query.Find(&rows).Error
	return rows, err
}

func (self *QuizQuestionRepository) Create(question *entity.QuizQuestion, preload entity.QuizQuestionPreloadOptions) error {
	query := self.Db.Pg.Model(&entity.QuizQuestion{})
	preload.Preload(query, "")

	return query.Create(question).First(question).Error
}

func (self *QuizQuestionRepository) Delete(deleteBy *entity.QuizQuestion) error {
	return self.Db.Pg.
		Model(&entity.QuizQuestion{}).
		Where(deleteBy).
		Delete(deleteBy).
		Error
}

func (self *QuizQuestionRepository) Update(updateBy *entity.QuizQuestion, question *entity.QuizQuestion) (*entity.QuizQuestion, error) {
	updated := *question
	result := self.Db.Pg.
		Model(&updated).
		Where(updateBy).
		Updates(&updated)

	if result.Error != nil {
		return nil, result.Error
	}
	if result.RowsAffected == 0 {
		return nil, &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}

	return &updated, nil
}

func (self *QuizQuestionRepository) UpdatePositions(positions []utils.Positions) error {
	if len(positions) == 0 {
		return nil
	}

	values := make([]string, len(positions))
	args := make([]interface{}, 0, len(positions)*2)

	for i, p := range positions {
		values[i] = fmt.Sprintf("($%d::bigint, $%d::int)", i*2+1, i*2+2)
		args = append(args, p.ID, p.Position)
	}

	query := fmt.Sprintf(`
		UPDATE quiz_questions q
		SET position = v.position
		FROM (
			VALUES %s
		) AS v(id, position)
		WHERE q.id = v.id
	`, strings.Join(values, ","))

	return self.Db.Pg.Exec(query, args...).Error
}
