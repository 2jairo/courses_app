package db

import (
	"context"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/typesense/typesense-go/v4/typesense"
)

func typesenseNew() (*typesense.Client, error) {
	client := typesense.NewClient(
		typesense.WithServer(config.TypesenseUrl),
		typesense.WithAPIKey(config.TypesenseApiKey),
		typesense.WithConnectionTimeout(5*time.Second),
		typesense.WithCircuitBreakerMaxRequests(50),
		typesense.WithCircuitBreakerInterval(2*time.Minute),
		typesense.WithCircuitBreakerTimeout(1*time.Minute),
	)

	_, err := client.Health(context.TODO(), time.Second*5)
	return client, global.Err(err)
}
