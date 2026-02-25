package repository

import (
	"errors"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type QuizAttemptRepository struct {
	Db *db.DatabasesConnection
}

// FindActive returns the current active attempt for a user on a lecture.
// and either has no expiry (zero time) or hasn't expired yet.
func (r *QuizAttemptRepository) FindActive(userID, lectureID entitycommon.Id, preload entity.QuizAttemptPreloadOptions) (*entity.QuizAttempt, error) {
	attempt := &entity.QuizAttempt{}
	zeroTime := time.Time{}
	query := r.Db.Pg.Model(&entity.QuizAttempt{}).Where(
		"user_id = ? AND lecture_id = ? AND (expires_at = ? OR expires_at > ?) AND completed_at IS NULL",
		userID, lectureID, zeroTime, time.Now(),
	)

	preload.Preload(query, "")

	if err := query.First(attempt).Error; err != nil {
		return nil, err
	}
	return attempt, nil
}

// Create persists a new quiz attempt.
func (r *QuizAttemptRepository) Create(attempt *entity.QuizAttempt) error {
	return r.Db.Pg.Create(attempt).Error
}

func (self *QuizAttemptRepository) UpdateOne(updateBy *entity.QuizAttempt, values *entity.QuizAttempt) error {
	return self.Db.Pg.
		Clauses(clause.Returning{}).
		Where(updateBy).
		Updates(values).
		Error
}

type QuizAttemptAnswerRepository struct {
	Db *db.DatabasesConnection
}

// Upsert creates or updates the answer for a given attempt+question pair.
func (r *QuizAttemptAnswerRepository) Upsert(answer *entity.QuizAttemptAnswer) error {
	existing := &entity.QuizAttemptAnswer{}
	err := r.Db.Pg.
		Where("attempt_id = ? AND question_id = ?", answer.AttemptID, answer.QuestionID).
		First(existing).Error

	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		return r.Db.Pg.Create(answer).Error
	}

	answer.Model = existing.Model
	return r.Db.Pg.Save(answer).Error
}
