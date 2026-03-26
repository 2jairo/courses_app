package coursepurchases

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
)

type FindOneInput struct {
	UserID   entitycommon.Id
	CourseID entitycommon.Id
}
