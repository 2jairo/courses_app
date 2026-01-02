package main

import (
	"github.com/2jairo/courses_app/backend/A_core_service/routes/videos"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

func registerApiRoutes(app *fiber.App, state *state.AppState) {
	api := app.Group("/api")

	videoEndpoints := videos.VideosEndpoints{State: state}
	videoEndpoints.RegisterRoutes(api.Group("/videos"))
}
