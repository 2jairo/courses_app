package shoppingcart

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type GetShoppingCartRequest struct {
}

func (self *GetShoppingCartRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	return nil
}

type ClearShoppingCartRequest struct{}

func (self *ClearShoppingCartRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	return nil
}

type UpdateShoppingCartRequest struct {
	Body struct {
		Items []UpdateShoppingCartItemRequest `json:"items" validate:"required,min=1,dive"`
	}
}
type UpdateShoppingCartItemRequest struct {
	CourseID    int64                              `json:"courseId" validate:"required"`
	Quantity    int32                              `json:"quantity" validate:"required,max=500"`
	Destination entity.ShoppingCartItemDestination `json:"destination" validate:"required,enum"`
}

func (self *UpdateShoppingCartRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Body, ctx.BodyParser); err != nil {
		return err
	}

	self.Body.Items = utils.RemoveDuplicatesWithCb(self.Body.Items, func(item UpdateShoppingCartItemRequest) int64 {
		return item.CourseID
	})
	return nil
}
