package repository

import (
	"encoding/json"
	"strconv"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
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
	usersId []entitycommon.Id,
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

func (self *FileRepository) FindIn(ids []entitycommon.Id, findBy *entity.File, preload entity.FilePreloadOptions) ([]entity.File, error) {
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

func getCServiceMsg(file *entity.File) (string, any) {
	common := entity.CServiceProcessAnyCommonRequest{
		UserId:           int64(file.UserID),
		FileId:           int64(file.ID),
		FilePath:         file.RawFileName,
		FileSize:         file.FileSize,
		OriginalFileName: file.OriginalName,
	}

	switch file.Kind {
	case entity.FileKindImage:
		return config.AmqpImageQueueCycle.SrcQueueName, entity.CServiceProcessImageRequest{
			Common: common,
			// VideoId: 0, //TODO
		}
	case entity.FileKindVideo:
		return config.AmqpVideoQueueCycle.SrcQueueName, entity.CServiceProcessVideoRequest{
			Common:   common,
			CourseId: int64(file.CourseID),
		}
	case entity.FileKindOther:
		return config.AmqpOtherQueueCycle.SrcQueueName, entity.CServiceProcessOtherRequest{
			Common: common,
		}
	}
	return "", nil
}

func (self *FileRepository) CServiceHandleMsg(
	msg amqp.Delivery,
	updateMetadata func(rawMsg []byte, metadataValues map[string]any) (entity.FileStatus, error),
) (*entity.File, error) {
	correlationId, _ := strconv.ParseInt(msg.CorrelationId, 10, 64)

	file := &entity.File{Model: entitycommon.Model{ID: entitycommon.Id(correlationId)}}
	if err := self.FindOne(
		file,
		entity.FilePreloadOptions{},
	); err != nil {
		return nil, err
	}

	metadataValues := make(map[string]any)
	if err := json.Unmarshal(file.Metadata, &metadataValues); err != nil {
		return nil, err
	}

	newFileStatus, err := updateMetadata(msg.Body, metadataValues)
	if err != nil {
		return nil, err
	}

	newMetadata, _ := json.Marshal(metadataValues)

	findBy := &entity.File{Model: entitycommon.Model{ID: entitycommon.Id(correlationId)}}
	update := &entity.File{Metadata: newMetadata, Status: newFileStatus}

	if err := self.UpdateOne(findBy, update); err != nil {
		return nil, err
	}

	return update, nil
}

func (self *FileRepository) WaitUntilCServiceResponse(
	file *entity.File,
	msgHandler func(rawMsg []byte, metadataValues map[string]any) (entity.FileStatus, error),
) error {
	channelName, msg := getCServiceMsg(file)
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
	corrId := strconv.FormatInt(int64(file.ID), 10)

	if err := self.Db.Amqp.Publish(
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
	); err != nil {
		return err
	}

	for msg := range msgs {
		newFile, err := self.CServiceHandleMsg(msg, msgHandler)
		if err != nil {
			return err
		}
		if newFile.Status == entity.FileStatusFailed || newFile.Status == entity.FileStatusReady {
			*file = *newFile
			break
		}
	}

	return nil
}

func (self *FileRepository) NotifyCService(file *entity.File) error {
	channelName, msg := getCServiceMsg(file)
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
			CorrelationId: strconv.FormatInt(int64(file.ID), 10),
		},
	); err != nil {
		return err
	}

	return nil
}
