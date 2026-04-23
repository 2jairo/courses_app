package amqpwrapper

import (
	"context"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/rabbitmq/amqp091-go"
)

type QueueConsumer struct {
	Dbs            *db.DatabasesConnection
	CtrlC          context.Context
	AmqpQueueCycle config.AmqpQueueCycle
	ConsumerTag    string
	Handler        func(msg amqp091.Delivery) error
}

func (self *QueueConsumer) StartConsumer() error {
	ch, err := self.Dbs.AmqpConn.Channel()
	if err != nil {
		return global.Err(err)
	}
	defer ch.Close()

	if err := ch.Qos(1, 0, false); err != nil {
		return global.Err(err)
	}

	q, err := ch.QueueDeclare(
		self.AmqpQueueCycle.DstExchangeQueueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return global.Err(err)
	}

	if err := ch.ExchangeDeclare(
		self.AmqpQueueCycle.DstExchangeName,
		self.AmqpQueueCycle.DstExchangeType,
		true,
		false,
		false,
		false,
		nil,
	); err != nil {
		return global.Err(err)
	}

	if err := ch.QueueBind(
		q.Name,
		self.AmqpQueueCycle.DstRoutingKey,
		self.AmqpQueueCycle.DstExchangeName,
		false,
		nil,
	); err != nil {
		return global.Err(err)
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
		return global.Err(err)
	}

	for {
		select {
		case <-self.CtrlC.Done():
			return nil
		case msg, ok := <-msgs:
			if !ok {
				// Broker closed the delivery channel; stop to avoid a tight loop with zero-value messages.
				return nil
			}
			if err := self.Handler(msg); err != nil {
				msg.Reject(false)
			} else {
				msg.Ack(false)
			}
		}
	}
}
