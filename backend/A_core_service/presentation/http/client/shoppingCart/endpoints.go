package shoppingcart

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	shoppingcart "github.com/2jairo/courses_app/backend/A_core_service/application/services/shoppingCart"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type ShoppingCartEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *ShoppingCartEndpoints) RegisterRoutes(r fiber.Router) {
	requiredAuth := self.Services.Middleware.ClientAuth()

	r.Get("/", requiredAuth, self.GetShoppingCart)
	r.Put("/", requiredAuth, self.UpdateShoppingCart)
	r.Delete("/", requiredAuth, self.ClearShoppingCart)
}

func (self *ShoppingCartEndpoints) GetShoppingCart(ctx *fiber.Ctx) error {
	c := &GetShoppingCartRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	cart, err := self.Services.ShoppingCart.GetShoppingCart(
		shoppingcart.GetShoppingCartInput{UserID: entitycommon.Id(userJwtClaims.UserId)},
	)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(cart))
}

func (self *ShoppingCartEndpoints) UpdateShoppingCart(ctx *fiber.Ctx) error {
	c := &UpdateShoppingCartRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	items := make([]shoppingcart.UpdateShoppingCartItemInput, len(c.Body.Items))
	for i, it := range c.Body.Items {
		items[i] = shoppingcart.UpdateShoppingCartItemInput{
			CourseID:    entitycommon.Id(it.CourseID),
			Quantity:    it.Quantity,
			Destination: it.Destination,
		}
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	cart, err := self.Services.ShoppingCart.UpdateShoppingCart(
		shoppingcart.UpdateShoppingCartInput{
			UserID: entitycommon.Id(userJwtClaims.UserId),
			Items:  items,
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(cart))
}

func (self *ShoppingCartEndpoints) ClearShoppingCart(ctx *fiber.Ctx) error {
	req := &ClearShoppingCartRequest{}
	if err := req.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)

	err := self.Services.ShoppingCart.ClearShoppingCart(
		shoppingcart.ClearShoppingCartInput{UserID: entitycommon.Id(userJwtClaims.UserId)},
	)
	if err != nil {
		return err
	}

	return ctx.SendStatus(204)
}
