package cservice

import (
	"context"

	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	amqpwrapper "github.com/2jairo/courses_app/backend/A_core_service/infrastructure/amqpWrapper"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/amqp/cservice/image"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/amqp/cservice/video"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
)

func RegisterHandlers(
	ctx context.Context,
	state *state.AppState,
	services *services.AppServices,
) {
	go func() {
		img := amqpwrapper.QueueConsumer{
			State:        state,
			CtrlC:        ctx,
			QueueName:    "image.updates.db",
			ExchangeName: "image.updates",
			ConsumerTag:  "a_core_service",
			Handler:      &image.ImageMsgHandler{Services: services},
		}
		img.StartConsumer()
	}()

	go func() {
		v := amqpwrapper.QueueConsumer{
			State:        state,
			CtrlC:        ctx,
			QueueName:    "video.updates.db",
			ExchangeName: "video.updates",
			ConsumerTag:  "a_core_service",
			Handler:      &video.VideoMsgHandler{Services: services},
		}
		v.StartConsumer()
	}()
}
