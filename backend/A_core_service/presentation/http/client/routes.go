package client

import (
	"fmt"

	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	courseanalytics "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/courseAnalytics"
	courseprogress "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/courseProgress"
	coursereviews "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/courseReviews"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/courses"
	favoritecourses "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/favoriteCourses"
	lecturecomments "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/lectureComments"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/lectures"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/quizzes"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, services *services.AppServices, utils *utils.AppUtils) {
	cli := app.Group("/cli")

	courses := courses.CoursesEndpoints{Services: services, Utils: utils}
	courses.RegisterRoutes(cli.Group("/courses"))

	courseReviews := coursereviews.CourseReviewsEndpoints{Services: services, Utils: utils}
	courseReviews.RegisterRoutes(cli.Group("/course-reviews"))

	favoriteCourses := favoritecourses.FavoriteCoursesEndpoints{Services: services, Utils: utils}
	favoriteCourses.RegisterRoutes(cli.Group("/favorite-courses"))

	courseProgress := courseprogress.CourseProgressEndpoints{Services: services, Utils: utils}
	courseProgress.RegisterRoutes(cli.Group("/course-progress"))

	courseAnalytics := courseanalytics.CourseAnalyticsEndpoints{Services: services, Utils: utils}
	courseAnalytics.RegisterRoutes(cli.Group("/analytics/courses"))

	lectures := lectures.LecturesEndpoints{Services: services, Utils: utils}
	lectures.RegisterRoutes(cli.Group("/lectures"))

	lectureComments := lecturecomments.LectureCommentsEndpoints{Services: services, Utils: utils}
	lectureComments.RegisterRoutes(cli.Group("/lecture-comments"))

	quizzes := quizzes.QuizzesEndpoints{Services: services, Utils: utils}
	quizzes.RegisterRoutes(cli.Group("/quizzes"))

	routes := app.GetRoutes(true)
	for _, route := range routes {
		fmt.Printf("%v: %v\n", route.Method, route.Path)
	}
}
