package main

import (
	"fmt"

	coursepermissions "github.com/2jairo/courses_app/backend/A_core_service/presentation/coursePermissions"
	coursesections "github.com/2jairo/courses_app/backend/A_core_service/presentation/courseSections"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/courses"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/files"
	lectureassets "github.com/2jairo/courses_app/backend/A_core_service/presentation/lectureAssets"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/lectures"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

func registerApiRoutes(app *fiber.App, state *state.AppState) {
	api := app.Group("/api")

	courses := courses.CoursesEndpoints{State: state}
	courses.RegisterRoutes(api.Group("/courses"))

	coursePermissions := coursepermissions.CoursePermissionsEndpoints{State: state}
	coursePermissions.RegisterRoutes(api.Group("/course-permissions"))

	coursesSections := coursesections.CourseSectionsEndpoints{State: state}
	coursesSections.RegisterRoutes(api.Group("/course-sections"))

	lectures := lectures.LecturesEndpoints{State: state}
	lectures.RegisterRoutes(api.Group("/lectures"))

	lectureAssets := lectureassets.LectureAssetsEndpoints{State: state}
	lectureAssets.RegisterRoutes(api.Group("/lecture-assets"))

	files := files.FilesEndpoints{State: state}
	files.RegisterRoutes(api.Group("/files"))

	routes := app.GetRoutes(true)
	for _, route := range routes {
		fmt.Printf("%v: %v\n", route.Method, route.Path)
	}
}
