package main

import (
	coursesections "github.com/2jairo/courses_app/backend/A_core_service/routes/courseSections"
	"github.com/2jairo/courses_app/backend/A_core_service/routes/courses"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

func registerApiRoutes(app *fiber.App, state *state.AppState) {
	api := app.Group("/api")

	coursesEndpoints := courses.CoursesEndpoints{State: state}
	coursesEndpoints.RegisterRoutes(api.Group("/courses"))

	coursesSections := coursesections.CourseSectionsEndpoints{State: state}
	coursesSections.RegisterRoutes(api.Group("/sections"))
}
