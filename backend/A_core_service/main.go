//go:generate swag init
package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	_ "github.com/2jairo/courses_app/backend/A_core_service/docs" // go generate . (go install github.com/swaggo/swag/cmd/swag)
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
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

	app := fiber.New(fiber.Config{
		ErrorHandler:                 localerror.ErrorHandler,
		DisablePreParseMultipartForm: true,
	})
	app.Use(compress.New())
	app.Use(recover.New())
	app.Use(cors.New())
	app.Get("/docs/*", swagger.HandlerDefault)

	app.Server().StreamRequestBody = true

	appState := state.New()
	registerApiRoutes(app, appState)

	go func() {
		app.Listen(config.Socket)
	}()

	withGracefullShutdown(app)
}

func withGracefullShutdown(app *fiber.App) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	<-quit
	log.Println("Shutting down server...")

	if err := app.Shutdown(); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited gracefully")
}
