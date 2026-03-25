package shoppingcart

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
)

type GetShoppingCartInput struct {
	UserID entitycommon.Id
}

type ClearShoppingCartInput struct {
	UserID entitycommon.Id
}

type UpdateShoppingCartItemInput struct {
	CourseID    entitycommon.Id
	Quantity    int32
	Destination entity.ShoppingCartItemDestination
}

type UpdateShoppingCartInput struct {
	UserID entitycommon.Id
	Items  []UpdateShoppingCartItemInput
}
