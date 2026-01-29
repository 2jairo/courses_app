package repository

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/2jairo/courses_app/backend/A_core_service/comunication/messages"
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

func (self *FileRepository) FindIn(ids []int64, preload entity.FilePreloadOptions) ([]entity.File, error) {
	rows := []entity.File{}

	query := self.Db.Pg.Model(&entity.File{}).
		Where("id IN ?", ids)

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

func (self *FileRepository) WaitUntilCServiceResponse(file *entity.File) error {
	msg := messages.CServiceProcessVideoRequest{
		UserId:   file.UserID,
		CourseId: file.CourseID,
		FileId:   file.ID,
		FileSize: file.FileSize,
		FilePath: file.RawFileName,
	}
	body, err := json.Marshal(msg)
	if err != nil {
		return err
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
		return err
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
		return err
	}
	corrId := strconv.FormatInt(file.ID, 10)

	channelName := "other"
	if file.Kind == entity.FileKindImage {
		channelName = "image"
	} else if file.Kind == entity.FileKindVideo {
		channelName = "video"
	}

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
	if err != nil {
		return err
	}

	for i := 0; i < 5; i++ {
		msg := <-msgs
		fmt.Printf("MSG: %v\n", string(msg.Body))
	}

	// select {
	// case msg := <-msgs:
	// 	// var result messages.ProcessImageResult
	// 	// if err := json.Unmarshal(msg.Body, &result); err != nil {
	// 	// 	return err
	// 	// }

	// 	// if result.Status == "error" {
	// 	// 	return errors.New(result.Error)
	// 	// }
	// 	fmt.Printf("MSG: %v\n", string(msg.Body))

	// 	return nil
	// case <-time.After(60 * time.Second):
	// 	return errors.New("timeout waiting for CService")
	// }

	return nil
}

func (self *FileRepository) NotifyCService(file *entity.File) error {
	msg := messages.CServiceProcessVideoRequest{
		UserId:   file.UserID,
		CourseId: file.CourseID,
		FileId:   file.ID,
		FileSize: file.FileSize,
		FilePath: file.RawFileName,
	}

	body, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	channelName := "other"
	if file.Kind == entity.FileKindImage {
		channelName = "image"
	} else if file.Kind == entity.FileKindVideo {
		channelName = "video"
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
