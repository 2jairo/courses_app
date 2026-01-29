package main

import (
	"fmt"

	"github.com/2jairo/courses_app/backend/A_core_service/presentationClient/courses"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

func registerApiClientRoutes(app *fiber.App, state *state.AppState) {
	api := app.Group("/cli")

	courses := courses.CoursesEndpoints{State: state}
	courses.RegisterRoutes(api.Group("/courses"))

	routes := app.GetRoutes(true)
	for _, route := range routes {
		fmt.Printf("%v: %v\n", route.Method, route.Path)
	}
}
