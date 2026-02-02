package amqpwrapper

import (
	"context"

	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
)

type QueueConsumer struct {
	Dbs          *db.DatabasesConnection
	Repo         *infrastructure.AppRepositories
	CtrlC        context.Context
	QueueName    string
	ExchangeName string
	ConsumerTag  string
	Handler      func(rawMsg []byte, metadataValues map[string]any) (entity.FileStatus, error)
}

func (self *QueueConsumer) StartConsumer() error {
	ch, err := self.Dbs.AmqpConn.Channel()
	if err != nil {
		return err
	}

	q, err := ch.QueueDeclare(
		self.QueueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	if err := ch.QueueBind(
		q.Name,
		"",
		self.ExchangeName,
		false,
		nil,
	); err != nil {
		return err
	}

	msgs, err := ch.Consume(
		q.Name,
		self.ConsumerTag,
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	for {
		select {
		case <-self.CtrlC.Done():
			return nil
		case msg := <-msgs:
			if err, _ := self.Repo.File.CServiceHandleMsg(msg, self.Handler); err != nil {
				msg.Reject(false)
			} else {
				msg.Ack(false)
			}
		}
	}
}
