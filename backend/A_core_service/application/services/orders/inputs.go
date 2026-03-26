package orders

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type GetUserOrdersInput struct {
	UserId     entitycommon.Id
	Pagination *utils.Pagination
}
