package favoritecourse

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type SetFavoriteInput struct {
	UserID   entitycommon.Id
	CourseID entitycommon.Id
	Add      bool
}

type GetFavoriteCoursesInput struct {
	UserID     entitycommon.Id
	Pagination *utils.Pagination
}
