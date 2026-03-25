package coursepurchases

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CoursePurchasesEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *CoursePurchasesEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())
	// r.Post("/", self.CreateCoursePurchase)
	// r.Get("/", self.GetCoursePurchases)
}
