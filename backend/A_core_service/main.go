//go:generate swag init
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	_ "github.com/2jairo/courses_app/backend/A_core_service/docs" // go generate . (go install github.com/swaggo/swag/cmd/swag)
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/amqp/cservice"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/api"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/swagger"
)

// @title A core service
func main() {
	config.GetEnv()

	// Fiber http handler
	app := fiber.New(fiber.Config{
		ErrorHandler:                 localerror.ErrorHandler,
		DisablePreParseMultipartForm: true,
	})
	app.Use(compress.New())
	app.Use(recover.New())
	app.Use(cors.New())
	app.Get("/docs/*", swagger.HandlerDefault)

	app.Server().StreamRequestBody = true

	dbs := db.NewDatabasesConnection()
	appState := state.NewAppState(dbs)
	services := services.NewAppServices(appState)

	api.RegisterRoutes(app, appState)
	client.RegisterRoutes(app, appState)

	// amqp handler
	ctx, cancel := context.WithCancel(context.Background())
	go func() {
		cservice.RegisterHandlers(ctx, appState, services)
	}()
	go func() {
		app.Listen(config.Socket)
	}()

	withGracefullShutdown(app, cancel)
}

func withGracefullShutdown(app *fiber.App, cancel context.CancelFunc) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	<-quit
	log.Println("Shutting down server...")

	if err := app.Shutdown(); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	cancel()

	log.Println("Server exited gracefully")
}
