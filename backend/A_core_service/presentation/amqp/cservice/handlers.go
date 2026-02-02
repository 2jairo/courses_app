package cservice

import (
	"context"

	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	amqpwrapper "github.com/2jairo/courses_app/backend/A_core_service/infrastructure/amqpWrapper"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/amqp/cservice/image"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/amqp/cservice/video"
)

func RegisterHandlers(
	ctx context.Context,
	dbs *db.DatabasesConnection,
	repo *infrastructure.AppRepositories,
	services *services.AppServices,
) {
	go func() {
		imgHandler := &image.ImageMsgHandler{Services: services}
		img := amqpwrapper.QueueConsumer{
			Dbs:          dbs,
			Repo:         repo,
			CtrlC:        ctx,
			QueueName:    config.AmqpImageQueueCycle.DstExchangeQueueName,
			ExchangeName: config.AmqpImageQueueCycle.DstExchangeName,
			ConsumerTag:  "a_core_service",
			Handler:      imgHandler.UpdateMetadata,
		}
		img.StartConsumer()
	}()

	go func() {
		videoHandler := &video.VideoMsgHandler{Services: services}
		v := amqpwrapper.QueueConsumer{
			Dbs:          dbs,
			Repo:         repo,
			CtrlC:        ctx,
			QueueName:    config.AmqpVideoQueueCycle.DstExchangeQueueName,
			ExchangeName: config.AmqpVideoQueueCycle.DstExchangeName,
			ConsumerTag:  "a_core_service",
			Handler:      videoHandler.UpdateMetadata,
		}
		v.StartConsumer()
	}()
}
