package amqpwrapper

import (
	"context"
	"encoding/json"
	"strconv"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	amqp "github.com/rabbitmq/amqp091-go"
)

type MessageHandler interface {
	UpdateMetadata(rawMsg []byte, metadataValues map[string]any) (entity.FileStatus, error)
}

type QueueConsumer struct {
	State        *state.AppState
	CtrlC        context.Context
	QueueName    string
	ExchangeName string
	ConsumerTag  string
	Handler      MessageHandler
}

func (self *QueueConsumer) StartConsumer() error {
	ch, err := self.State.Db.AmqpConn.Channel()
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

	msgHandler := &QueueConsumerDBMsgHandler{
		State:   self.State,
		Handler: self.Handler,
	}

	for {
		select {
		case <-self.CtrlC.Done():
			return nil
		case msg := <-msgs:
			if err := msgHandler.HandleMsg(msg); err != nil {
				msg.Reject(false)
			} else {
				msg.Ack(false)
			}
		}
	}
}

type QueueConsumerDBMsgHandler struct {
	State   *state.AppState
	Handler MessageHandler
}

func (self *QueueConsumerDBMsgHandler) HandleMsg(msg amqp.Delivery) error {
	correlationId, _ := strconv.ParseInt(msg.CorrelationId, 10, 64)

	file := &entity.File{Model: entitycommon.Model{ID: correlationId}}
	if err := self.State.FileRepository.FindOne(
		file,
		entity.FilePreloadOptions{},
	); err != nil {
		return err
	}

	metadataValues := make(map[string]any)
	if err := json.Unmarshal(file.Metadata, &metadataValues); err != nil {
		return err
	}

	newFileStatus, err := self.Handler.UpdateMetadata(msg.Body, metadataValues)
	if err != nil {
		return err
	}

	newMetadata, _ := json.Marshal(metadataValues)

	findBy := &entity.File{Model: entitycommon.Model{ID: correlationId}}
	update := &entity.File{Metadata: newMetadata, Status: newFileStatus}

	if err := self.State.FileRepository.UpdateOne(findBy, update); err != nil {
		return err
	}

	return nil
}
