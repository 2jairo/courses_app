package client

import (
	"fmt"

	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	courseanalytics "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/courseAnalytics"
	courseprogress "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/courseProgress"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/courses"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/lectures"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, services *services.AppServices, utils *utils.AppUtils) {
	cli := app.Group("/cli")

	courses := courses.CoursesEndpoints{Services: services, Utils: utils}
	courses.RegisterRoutes(cli.Group("/courses"))

	courseProgress := courseprogress.CourseProgressEndpoints{Services: services, Utils: utils}
	courseProgress.RegisterRoutes(cli.Group("/course-progress"))

	courseAnalytics := courseanalytics.CourseAnalyticsEndpoints{Services: services, Utils: utils}
	courseAnalytics.RegisterRoutes(cli.Group("/analytics/courses"))

	lectures := lectures.LecturesEndpoints{Services: services, Utils: utils}
	lectures.RegisterRoutes(cli.Group("/lectures"))

	routes := app.GetRoutes(true)
	for _, route := range routes {
		fmt.Printf("%v: %v\n", route.Method, route.Path)
	}
}
