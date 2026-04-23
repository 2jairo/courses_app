package coursepurchases

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type FindOneInput struct {
	UserID   entitycommon.Id
	CourseID entitycommon.Id
}

type GetPurchasedCoursesInput struct {
	UserID     entitycommon.Id
	Pagination *utils.Pagination
}
