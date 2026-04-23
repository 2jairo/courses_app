package cservice

import (
	"context"

	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	amqpwrapper "github.com/2jairo/courses_app/backend/A_core_service/infrastructure/amqpWrapper"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/amqp/cservice/image"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/amqp/cservice/other"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/amqp/cservice/video"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/rabbitmq/amqp091-go"
)

func RegisterCServiceHandlers(
	ctx context.Context,
	dbs *db.DatabasesConnection,
	repo *infrastructure.AppRepositories,
	services *services.AppServices,
) {
	go func() {
		imgHandler := &image.ImageMsgHandler{Services: services}
		img := amqpwrapper.QueueConsumer{
			Dbs:            dbs,
			CtrlC:          ctx,
			AmqpQueueCycle: config.AmqpCServiceImageQueueCycle,
			ConsumerTag:    "a_core_service",
			Handler: func(msg amqp091.Delivery) error {
				_, err := repo.File.CServiceHandleMsg(msg, imgHandler.UpdateMetadata)
				return global.Err(err)
			},
		}
		if err := img.StartConsumer(); err != nil {
			panic(err)
		}
	}()

	go func() {
		videoHandler := &video.VideoMsgHandler{Services: services}
		v := amqpwrapper.QueueConsumer{
			Dbs:            dbs,
			CtrlC:          ctx,
			AmqpQueueCycle: config.AmqpCServiceVideoQueueCycle,
			ConsumerTag:    "a_core_service",
			Handler: func(msg amqp091.Delivery) error {
				_, err := repo.File.CServiceHandleMsg(msg, videoHandler.UpdateMetadata)
				return global.Err(err)
			},
		}
		if err := v.StartConsumer(); err != nil {
			panic(err)
		}
	}()

	go func() {
		otherHandler := &other.OtherMsgHandler{Services: services}
		o := amqpwrapper.QueueConsumer{
			Dbs:            dbs,
			CtrlC:          ctx,
			AmqpQueueCycle: config.AmqpCServiceOtherQueueCycle,
			ConsumerTag:    "a_core_service",
			Handler: func(msg amqp091.Delivery) error {
				_, err := repo.File.CServiceHandleMsg(msg, otherHandler.UpdateMetadata)
				return global.Err(err)
			},
		}
		if err := o.StartConsumer(); err != nil {
			panic(err)
		}
	}()
}
