package api

import (
	coursepermissions "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/api/coursePermissions"
	coursesections "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/api/courseSections"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/api/courses"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/api/files"
	filesvideo "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/api/filesVideo"
	lectureassets "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/api/lectureAssets"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/api/lectures"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, state *state.AppState) {
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

	filesvideo := filesvideo.FilesVideoEndpoints{State: state}
	filesvideo.RegisterRoutes(api.Group("/files-video"))
}
