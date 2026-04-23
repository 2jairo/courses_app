package db

import (
	"fmt"

	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/stripe/stripe-go/v84"
	"github.com/typesense/typesense-go/v4/typesense"
	"gorm.io/gorm"
)

type DatabasesConnection struct {
	Pg              *gorm.DB
	Ch              *gorm.DB
	Amqp            *amqp.Channel
	AmqpConn        *amqp.Connection
	Stripe          *stripe.Client
	Typesense       *typesense.Client
	GatewayIASearch *GatewayIASearchClient
}

func NewDatabasesConnection(u *utils.AppUtils) *DatabasesConnection {
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

	// STRIPE
	stripeClient := stripeNew()

	//Typesense
	typesenseClient, err5 := typesenseNew()
	if err5 != nil {
		panic(fmt.Sprintf("Failed to initialize app state: %s", err5))
	}

	// gateway IA
	gatewayClient := NewGatewayIASearchClient(u)

	return &DatabasesConnection{
		Pg:              pg,
		Ch:              ch,
		Amqp:            amqp,
		AmqpConn:        amqpConn,
		Stripe:          stripeClient,
		Typesense:       typesenseClient,
		GatewayIASearch: gatewayClient,
	}
}
