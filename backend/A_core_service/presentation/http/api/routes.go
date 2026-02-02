package api

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	coursepermissions "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/api/coursePermissions"
	coursesections "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/api/courseSections"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/api/courses"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/api/files"
	filesvideo "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/api/filesVideo"
	lectureassets "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/api/lectureAssets"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/api/lectures"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, services *services.AppServices, utils *utils.AppUtils) {
	api := app.Group("/api")

	courses := courses.CoursesEndpoints{Services: services, Utils: utils}
	courses.RegisterRoutes(api.Group("/courses"))

	coursePermissions := coursepermissions.CoursePermissionsEndpoints{Services: services, Utils: utils}
	coursePermissions.RegisterRoutes(api.Group("/course-permissions"))

	coursesSections := coursesections.CourseSectionsEndpoints{Services: services, Utils: utils}
	coursesSections.RegisterRoutes(api.Group("/course-sections"))

	lectures := lectures.LecturesEndpoints{Services: services, Utils: utils}
	lectures.RegisterRoutes(api.Group("/lectures"))

	lectureAssets := lectureassets.LectureAssetsEndpoints{Services: services, Utils: utils}
	lectureAssets.RegisterRoutes(api.Group("/lecture-assets"))

	files := files.FilesEndpoints{Services: services, Utils: utils}
	files.RegisterRoutes(api.Group("/files"))

	filesvideo := filesvideo.FilesVideoEndpoints{Services: services, Utils: utils}
	filesvideo.RegisterRoutes(api.Group("/files-video"))
}
