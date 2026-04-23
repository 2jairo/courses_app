package coursetags

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type GetTagsInput struct {
	Pagination  *utils.Pagination
	QueryByName string
}

type GetCourseTagsInput struct {
	CourseID entitycommon.Id
}

type SetCourseTagsInput struct {
	CourseID entitycommon.Id
	Tags     []SetCourseTagsTagInput
}
type SetCourseTagsTagInput struct {
	Name string
}
