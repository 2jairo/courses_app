package favoritecourse

import entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"

type SetFavoriteInput struct {
	UserID   entitycommon.Id
	CourseID entitycommon.Id
	Add      bool
}
