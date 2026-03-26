package coursegiftcodes

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type GetOrderItemGiftCodesInput struct {
	OrderID  entitycommon.Id
	CourseID entitycommon.Id
	UserID   entitycommon.Id
}

type GetOrderGiftCodesInput struct {
	OrderID    entitycommon.Id
	CourseID   entitycommon.Id
	Pagination *utils.Pagination
}

type RedeemGiftCodeInput struct {
	Code   string
	UserID entitycommon.Id
}
