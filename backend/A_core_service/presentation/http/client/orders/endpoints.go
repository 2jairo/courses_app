package orders

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/orders"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type OrdersEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *OrdersEndpoints) RegisterRoutes(r fiber.Router) {
	requiredAuth := self.Services.Middleware.ClientAuth()

	r.Get("/", requiredAuth, self.GetUserOrders)
}

func (self *OrdersEndpoints) GetUserOrders(ctx *fiber.Ctx) error {
	req := &GetUserOrdersRequest{}
	if err := req.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	orders, err := self.Services.Orders.GetUserOrders(
		orders.GetUserOrdersInput{
			UserId:     entitycommon.Id(userJwtClaims.UserId),
			Pagination: &req.Query.Pagination,
		},
	)
	if err != nil {
		return err
	}

	ctx.Status(200).JSON(req.getResponse(orders))
	return nil
}
