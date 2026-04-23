package clickhouse

import (
	"context"

	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	amqpwrapper "github.com/2jairo/courses_app/backend/A_core_service/infrastructure/amqpWrapper"
	"github.com/rabbitmq/amqp091-go"
)

func RegisterClickhouseHandlers(
	ctx context.Context,
	dbs *db.DatabasesConnection,
	repo *infrastructure.AppRepositories,
	services *services.AppServices,
) {
	go func() {
		q := amqpwrapper.QueueConsumer{
			Dbs:            dbs,
			CtrlC:          ctx,
			AmqpQueueCycle: config.AmqpClickhouseCourseStatsToTypesenseCycle,
			ConsumerTag:    "a_core_service",
			Handler: func(msg amqp091.Delivery) error {
				return repo.Course.ClickhouseHandleAmqpMsg(msg)
			},
		}
		if err := q.StartConsumer(); err != nil {
			panic(err)
		}
	}()
}
