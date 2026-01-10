package repository

import (
	"encoding/json"

	"github.com/2jairo/courses_app/backend/A_core_service/comunication"
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	amqp "github.com/rabbitmq/amqp091-go"
)

type FileRepository struct {
	Db *db.DatabasesConnection
}

func (self *FileRepository) Find(findBy *entity.File, preload entity.FilePreloadOptions) ([]entity.File, error) {
	rows := []entity.File{}

	query := self.Db.Pg.Model(&entity.File{}).
		Where(findBy)

	preload.Preload(query, "")

	err := query.Find(&rows).Error
	return rows, err
}

func (self *FileRepository) Create(file *entity.File, prelaod entity.FilePreloadOptions) error {
	query := self.Db.Pg.Model(&entity.File{})
	prelaod.Preload(query, "")

	return query.Create(file).First(file).Error
}

func (self *FileRepository) NotifyCService(file *entity.File) error {
	msg := comunication.CServiceProcessVideoMessage{
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
			ContentType: "application/json",
			Body:        body,
		},
	); err != nil {
		return err
	}

	return nil
}
