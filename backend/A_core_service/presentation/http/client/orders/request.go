package orders

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type GetUserOrdersRequest struct {
	Query struct {
		utils.Pagination
	}
}

func (self *GetUserOrdersRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(&self.Query, ctx.QueryParser)
}
