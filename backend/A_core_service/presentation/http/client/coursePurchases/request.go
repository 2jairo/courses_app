package coursepurchases

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type GetPurchasedCoursesRequest struct {
	Query struct {
		utils.Pagination
	}
}

func (self *GetPurchasedCoursesRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(&self.Query, ctx.QueryParser)
}
