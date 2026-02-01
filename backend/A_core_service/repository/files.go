package repository

import (
	"encoding/json"
	"strconv"

	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
	amqp "github.com/rabbitmq/amqp091-go"
	"gorm.io/gorm/clause"
)

type FileRepository struct {
	Db *db.DatabasesConnection
}

func (self *FileRepository) Find(
	findBy *entity.File,
	preload entity.FilePreloadOptions,
	kind []entity.FileKind,
	status []entity.FileStatus,
	usersId []int64,
	q string,
	sortOrder *utils.SortOrder,
	sortBy *entity.FileSortBy,
	pagination *utils.Pagination,
) ([]entity.File, error) {
	rows := []entity.File{}

	query := self.Db.Pg.Model(&entity.File{}).
		Where(findBy)

	if len(kind) > 0 {
		values := make([]interface{}, len(kind))
		for i, v := range kind {
			values[i] = v
		}
		query = query.Where(clause.IN{
			Column: "kind",
			Values: values,
		})
	}
	if len(status) > 0 {
		values := make([]interface{}, len(status))
		for i, v := range status {
			values[i] = v
		}
		query = query.Where(clause.IN{
			Column: "status",
			Values: values,
		})
	}
	if len(usersId) > 0 {
		values := make([]interface{}, len(usersId))
		for i, v := range usersId {
			values[i] = v
		}
		query = query.Where(clause.IN{
			Column: "user_id",
			Values: values,
		})
	}
	if len(q) > 0 {
		query = query.Where(clause.Like{
			Column: "original_name",
			Value:  "%" + q + "%",
		})
	}

	if sortBy != nil {
		order := utils.SortOrderAsc
		if sortOrder != nil {
			order = *sortOrder
		}

		query.Order(sortBy.Column() + " " + string(order))
	}

	preload.Preload(query, "")

	if pagination != nil {
		query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}

	err := query.Find(&rows).Error
	return rows, err
}

func (self *FileRepository) FindIn(ids []int64, findBy *entity.File, preload entity.FilePreloadOptions) ([]entity.File, error) {
	rows := []entity.File{}

	query := self.Db.Pg.Model(&entity.File{}).
		Where("id IN ?", ids).
		Where(findBy)

	preload.Preload(query, "")

	err := query.Find(&rows).Error
	return rows, err
}

func (self *FileRepository) FindOne(findBy *entity.File, preload entity.FilePreloadOptions) error {
	query := self.Db.Pg.Model(&entity.File{}).
		Where(findBy)

	preload.Preload(query, "")

	return query.First(findBy).Error
}

func (self *FileRepository) Create(file *entity.File, prelaod entity.FilePreloadOptions) error {
	query := self.Db.Pg.Model(&entity.File{})
	prelaod.Preload(query, "")

	return query.Create(file).First(file).Error
}

func (self *FileRepository) UpdateOne(findBy *entity.File, update *entity.File) error {
	result := self.Db.Pg.
		Model(&update).
		Where(findBy).
		Clauses(clause.Returning{}).
		Updates(&update)

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}

	return nil
}

func (self *FileRepository) WaitUntilCServiceResponse(file *entity.File) (<-chan amqp.Delivery, error) {
	//TODO
	channelName := ""
	var msg any

	body, err := json.Marshal(msg)
	if err != nil {
		return nil, err
	}

	replyQueue, err := self.Db.Amqp.QueueDeclare(
		"",
		false,
		true,
		true,
		false,
		nil,
	)
	if err != nil {
		return nil, err
	}

	msgs, err := self.Db.Amqp.Consume(
		replyQueue.Name,
		"",
		true,
		true,
		false,
		false,
		nil,
	)
	if err != nil {
		return nil, err
	}
	corrId := strconv.FormatInt(file.ID, 10)

	err = self.Db.Amqp.Publish(
		"",
		channelName,
		false,
		false,
		amqp.Publishing{
			ContentType:   "application/json",
			Body:          body,
			CorrelationId: corrId,
			ReplyTo:       replyQueue.Name,
		},
	)
	return msgs, err
}

func (self *FileRepository) NotifyCService(file *entity.File) error {
	//TODO
	channelName := ""
	var msg any

	body, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	if err := self.Db.Amqp.Publish(
		"",
		channelName,
		false,
		false,
		amqp.Publishing{
			ContentType:   "application/json",
			Body:          body,
			CorrelationId: strconv.FormatInt(file.ID, 10),
		},
	); err != nil {
		return err
	}

	return nil
}
