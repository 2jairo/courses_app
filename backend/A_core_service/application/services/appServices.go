package services

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/analytics"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/course"
	coursegiftcodes "github.com/2jairo/courses_app/backend/A_core_service/application/services/courseGiftCodes"
	coursepermissions "github.com/2jairo/courses_app/backend/A_core_service/application/services/coursePermissions"
	courseprogress "github.com/2jairo/courses_app/backend/A_core_service/application/services/courseProgress"
	coursepurchases "github.com/2jairo/courses_app/backend/A_core_service/application/services/coursePurchases"
	coursereview "github.com/2jairo/courses_app/backend/A_core_service/application/services/courseReview"
	coursesection "github.com/2jairo/courses_app/backend/A_core_service/application/services/courseSection"
	favoritecourse "github.com/2jairo/courses_app/backend/A_core_service/application/services/favoriteCourse"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/file"
	filevideo "github.com/2jairo/courses_app/backend/A_core_service/application/services/fileVideo"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/lecture"
	lectureasset "github.com/2jairo/courses_app/backend/A_core_service/application/services/lectureAsset"
	lecturecomment "github.com/2jairo/courses_app/backend/A_core_service/application/services/lectureComment"
	lecturequiz "github.com/2jairo/courses_app/backend/A_core_service/application/services/lectureQuiz"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/middlewares"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/orders"
	paymentmethod "github.com/2jairo/courses_app/backend/A_core_service/application/services/paymentMethod"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/payments"
	shoppingcart "github.com/2jairo/courses_app/backend/A_core_service/application/services/shoppingCart"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/medama-io/go-useragent"
)

type AppServices struct {
	Middleware        middlewares.MiddlewareService
	Analytics         analytics.AnalyticsService
	Payments          payments.PaymentsService
	PaymentMethod     paymentmethod.PaymentMethodService
	Orders            orders.OrdersService
	Course            course.CourseService
	CoursePurchases   coursepurchases.CoursePurchasesService
	CourseGiftCodes   coursegiftcodes.CourseGiftCodesService
	CoursePermissions coursepermissions.CoursePermissionsService
	CourseSection     coursesection.CourseSectionService
	CourseProgress    courseprogress.CourseProgressService
	CourseReview      coursereview.CourseReviewService
	FavoriteCourse    favoritecourse.FavoriteCourseService
	Lecture           lecture.LectureService
	LectureAsset      lectureasset.LectureAssetService
	LectureComment    lecturecomment.LectureCommentService
	LectureQuiz       lecturequiz.LectureQuizService
	File              file.FileService
	FileVideo         filevideo.FileVideoService
	ShoppingCart      shoppingcart.ShoppingCartService
}

func NewAppServices(repo *infrastructure.AppRepositories, u *utils.AppUtils) *AppServices {
	return &AppServices{
		Middleware:        middlewares.MiddlewareService{Repo: repo, Utils: u, UserAgentParser: useragent.NewParser()},
		Analytics:         analytics.AnalyticsService{Repo: repo},
		Payments:          payments.PaymentsService{Repo: repo},
		PaymentMethod:     paymentmethod.PaymentMethodService{Repo: repo},
		Orders:            orders.OrdersService{Repo: repo},
		Course:            course.CourseService{Repo: repo},
		CoursePurchases:   coursepurchases.CoursePurchasesService{Repo: repo},
		CourseGiftCodes:   coursegiftcodes.CourseGiftCodesService{Repo: repo},
		CoursePermissions: coursepermissions.CoursePermissionsService{Repo: repo},
		CourseSection:     coursesection.CourseSectionService{Repo: repo},
		CourseProgress:    courseprogress.CourseProgressService{Repo: repo},
		CourseReview:      coursereview.CourseReviewService{Repo: repo},
		FavoriteCourse:    favoritecourse.FavoriteCourseService{Repo: repo},
		Lecture:           lecture.LectureService{Repo: repo},
		LectureAsset:      lectureasset.LectureAssetService{Repo: repo},
		LectureComment:    lecturecomment.LectureCommentService{Repo: repo},
		LectureQuiz:       lecturequiz.LectureQuizService{Repo: repo, Utils: u},
		File:              file.FileService{Repo: repo},
		FileVideo:         filevideo.FileVideoService{Repo: repo},
		ShoppingCart:      shoppingcart.ShoppingCartService{Repo: repo},
	}
}
