package db

import (
	"github.com/2jairo/courses_app/backend/A_core_service/config"
	amqp "github.com/rabbitmq/amqp091-go"
)

// amqp -> Advanced Message Queuing Protocol
func amqpNew() (*amqp.Channel, error) {
	conn, err := amqp.Dial(config.RabbitmqUrl)
	if err != nil {
		return nil, err
	}

	return conn.Channel()
}
