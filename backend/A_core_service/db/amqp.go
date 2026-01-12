package db

import (
	"github.com/2jairo/courses_app/backend/A_core_service/config"
	amqp "github.com/rabbitmq/amqp091-go"
)

// amqp -> Advanced Message Queuing Protocol
func amqpNew() (*amqp.Connection, error) {
	return amqp.Dial(config.RabbitmqUrl)
}
