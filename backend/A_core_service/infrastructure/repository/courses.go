package repository

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/typesenseentity"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/typesense/typesense-go/v4/typesense/api"
	"gorm.io/gorm/clause"
)

type CourseRepository struct {
	Db *db.DatabasesConnection
}

func (self *CourseRepository) FindOne(findBy *entity.Course, preload entity.CoursePreloadOptions) error {
	query := self.Db.Pg.Model(&entity.Course{}).
		Where(findBy)

	preload.Preload(query, "")

	return query.First(findBy).Error
}

func (self *CourseRepository) Find(findBy *entity.Course, preload entity.CoursePreloadOptions) ([]entity.Course, error) {
	rows := []entity.Course{}

	query := self.Db.Pg.Model(&entity.Course{}).
		Where(findBy)

	preload.Preload(query, "")

	err := query.Find(&rows).Error
	return rows, global.Err(err)
}

func (self *CourseRepository) Create(course *entity.Course) error {
	return self.Db.Pg.Create(course).Error
}

func (self *CourseRepository) Delete(deleteBy *entity.Course) error {
	return self.Db.Pg.
		Model(&entity.Course{}).
		Where(deleteBy).
		Delete(deleteBy).
		Error
}

func (self *CourseRepository) TypesenseUpsertDocument(document *typesenseentity.CourseDocument) error {
	_, err := self.Db.Typesense.
		Collection("courses").
		Documents().
		Upsert(context.TODO(), document, &api.DocumentIndexParameters{})
	return global.Err(err)
}

func (self *CourseRepository) TypesenseUpdateDocument(courseID int64, document interface{}) error {
	_, err := self.Db.Typesense.
		Collection("courses").
		Documents().
		Update(context.TODO(), document, &api.UpdateDocumentsParams{
			FilterBy: utils.Ref(fmt.Sprintf("id:=%d", courseID)),
		})
	return global.Err(err)
}

func (self *CourseRepository) TypesenseDeleteDocument(courseID int64) error {
	_, err := self.Db.Typesense.
		Collection("courses").
		Document(fmt.Sprintf("%d", courseID)).
		Delete(context.TODO())
	return global.Err(err)
}

func (r *CourseRepository) Update(updateBy *entity.Course, course *entity.Course, selectColumns ...string) (*entity.Course, error) {
	updated := *course //TODO? deep clone

	query := r.Db.Pg.
		Model(&updated).
		Where(updateBy).
		Clauses(clause.Returning{})

	if len(selectColumns) > 0 {
		query = query.Select(selectColumns)
	}

	result := query.Updates(&updated)

	if result.Error != nil {
		return nil, result.Error
	}
	if result.RowsAffected == 0 {
		return nil, &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}

	return &updated, nil
}

// TODO: search by prefix optimization
func (self *CourseRepository) FindCoursesWithPrefix(
	findBy *entity.Course,
	preload entity.CoursePreloadOptions,
	pagination *utils.Pagination,
	q string,
) ([]entity.Course, error) {
	rows := []entity.Course{}
	query := self.Db.Pg.Model(&entity.Course{}).
		Where(findBy)

	if len(q) > 0 {
		query = query.
			Where(clause.Like{
				Column: "title",
				Value:  "%" + q + "%",
			})
	}

	preload.Preload(query, "")

	if pagination != nil {
		query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}

	err := query.Find(&rows).Error
	return rows, global.Err(err)
}

func (self *CourseRepository) ClickhouseHandleAmqpMsg(msg amqp.Delivery) error {
	var body entity.ClickhouseCourseStatsAmqpMsg
	if err := json.Unmarshal(msg.Body, &body); err != nil {
		return global.Err(err)
	}

	update := &typesenseentity.CourseDocumentUpdateStats{
		AvgRating:        body.AvgRating,
		TotalReviews:     int64(body.TotalReviews),
		TotalPurchases:   int64(body.TotalPurchases),
		TotalViews:       int64(body.TotalViews),
		TotalImpressions: int64(body.TotalImpressions),
	}

	return self.TypesenseUpdateDocument(body.CourseID, update)
}
