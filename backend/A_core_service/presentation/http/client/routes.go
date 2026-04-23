package client

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/analytics"
	coursegiftcodes "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/courseGiftCodes"
	courseprogress "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/courseProgress"
	coursepurchases "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/coursePurchases"
	coursereviews "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/courseReviews"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/courses"
	favoritecourses "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/favoriteCourses"
	lecturecomments "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/lectureComments"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/lectures"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/notifications"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/orders"
	paymentmethods "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/paymentMethods"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/payments"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/quizzes"
	"github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/search"
	shoppingcart "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/client/shoppingCart"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, services *services.AppServices, utils *utils.AppUtils) {
	cli := app.Group("/cli")

	searchRoutes := search.SearchEndpoints{Services: services, Utils: utils}
	searchRoutes.RegisterRoutes(cli.Group("/search"))

	courses := courses.CoursesEndpoints{Services: services, Utils: utils}
	courses.RegisterRoutes(cli.Group("/courses"))

	coursePurchases := coursepurchases.CoursePurchasesEndpoints{Services: services, Utils: utils}
	coursePurchases.RegisterRoutes(cli.Group("/course-purchases"))

	courseGiftCodes := coursegiftcodes.CourseGiftCodesEndpoints{Services: services, Utils: utils}
	courseGiftCodes.RegisterRoutes(cli.Group("/gift-codes"))

	paymentMethods := paymentmethods.PaymentMethodsEndpoints{Services: services, Utils: utils}
	paymentMethods.RegisterRoutes(cli.Group("/payment-methods"))

	paymentsRoutes := payments.PaymentsEndpoints{Services: services, Utils: utils}
	paymentsRoutes.RegisterRoutes(cli.Group("/payments"))

	stripeWebhook := payments.StripeWebhookEndpoint{Services: services, Utils: utils}
	stripeWebhook.RegisterRoutes(app)

	orders := orders.OrdersEndpoints{Services: services, Utils: utils}
	orders.RegisterRoutes(cli.Group("/orders"))

	courseReviews := coursereviews.CourseReviewsEndpoints{Services: services, Utils: utils}
	courseReviews.RegisterRoutes(cli.Group("/course-reviews"))

	favoriteCourses := favoritecourses.FavoriteCoursesEndpoints{Services: services, Utils: utils}
	favoriteCourses.RegisterRoutes(cli.Group("/favorite-courses"))

	courseProgress := courseprogress.CourseProgressEndpoints{Services: services, Utils: utils}
	courseProgress.RegisterRoutes(cli.Group("/course-progress"))

	analytics := analytics.AnalyticsEndpoints{Services: services, Utils: utils}
	analytics.RegisterRoutes(cli.Group("/analytics"))

	lectures := lectures.LecturesEndpoints{Services: services, Utils: utils}
	lectures.RegisterRoutes(cli.Group("/lectures"))

	lectureComments := lecturecomments.LectureCommentsEndpoints{Services: services, Utils: utils}
	lectureComments.RegisterRoutes(cli.Group("/lecture-comments"))

	notificationsRoutes := notifications.NotificationsEndpoints{Services: services, Utils: utils}
	notificationsRoutes.RegisterRoutes(cli.Group("/notifications"))

	quizzes := quizzes.QuizzesEndpoints{Services: services, Utils: utils}
	quizzes.RegisterRoutes(cli.Group("/quizzes"))

	shoppingCart := shoppingcart.ShoppingCartEndpoints{Services: services, Utils: utils}
	shoppingCart.RegisterRoutes(cli.Group("/shopping-cart"))

	// routes := app.GetRoutes(true)
	// for _, route := range routes {
	// 	fmt.Printf("%v: %v\n", route.Method, route.Path)
	// }
}
