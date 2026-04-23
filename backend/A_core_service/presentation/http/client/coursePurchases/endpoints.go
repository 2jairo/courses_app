package coursepurchases

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	coursepurchases "github.com/2jairo/courses_app/backend/A_core_service/application/services/coursePurchases"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type CoursePurchasesEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *CoursePurchasesEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())

	r.Get("/", self.GetCoursePurchases)
}

func (self *CoursePurchasesEndpoints) GetCoursePurchases(ctx *fiber.Ctx) error {
	req := &GetPurchasedCoursesRequest{}
	if err := req.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	courses, err := self.Services.CoursePurchases.GetPurchasedCourses(
		coursepurchases.GetPurchasedCoursesInput{
			UserID:     entitycommon.Id(userJwtClaims.UserId),
			Pagination: &req.Query.Pagination,
		},
	)
	if err != nil {
		return global.Err(err)
	}

	ctx.Status(fiber.StatusOK).JSON(req.getResponse(courses))
	return nil
}
