package db

import (
	"fmt"

	amqp "github.com/rabbitmq/amqp091-go"
	"gorm.io/gorm"
)

type DatabasesConnection struct {
	Pg   *gorm.DB
	Amqp *amqp.Channel
}

func NewDatabasesConnection() *DatabasesConnection {
	pg, err1 := pgNew()
	if err1 != nil {
		panic(fmt.Sprintf("Failed to initialize app state: %s", err1))
	}

	amqp, err2 := amqpNew()
	if err2 != nil {
		panic(fmt.Sprintf("Failed to initialize app state: %s", err1))
	}

	return &DatabasesConnection{
		Pg:   pg,
		Amqp: amqp,
	}
}
