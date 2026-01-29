package db

import (
	"fmt"

	amqp "github.com/rabbitmq/amqp091-go"
	"gorm.io/gorm"
)

type DatabasesConnection struct {
	Pg       *gorm.DB
	Ch       *gorm.DB
	Amqp     *amqp.Channel
	AmqpConn *amqp.Connection
}

func NewDatabasesConnection() *DatabasesConnection {
	// POSTGRES
	pg, err1 := pgNew()
	if err1 != nil {
		panic(fmt.Sprintf("Failed to initialize app state: %s", err1))
	}

	// AMQP
	amqpConn, err2 := amqpNew()
	if err2 != nil {
		panic(fmt.Sprintf("Failed to initialize app state: %s", err2))
	}
	amqp, err3 := amqpConn.Channel()
	if err3 != nil {
		panic(fmt.Sprintf("Failed to initialize app state: %s", err3))
	}

	// CLICKHOUSE
	ch, err4 := chNew()
	if err4 != nil {
		panic(fmt.Sprintf("Failed to initialize app state: %s", err4))
	}

	return &DatabasesConnection{
		Pg:       pg,
		Ch:       ch,
		Amqp:     amqp,
		AmqpConn: amqpConn,
	}
}
