package notifications

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type GetUserNotificationsInput struct {
	UserID     entitycommon.Id
	Pagination *utils.Pagination
}

type MarkNotificationsAsSeenInput struct {
	UserID entitycommon.Id
}
