package coursepermissions

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type HasRoleInput struct {
	CourseId      entitycommon.Id
	UserJwtClaims *utils.ClientJwtClaims
	MinRole       entity.CoursePermissionsRole
	Optional      bool
}

type HasRoleFromCourseSectionInput struct {
	CourseSectionId entitycommon.Id
	UserJwtClaims   *utils.ClientJwtClaims
	MinRole         entity.CoursePermissionsRole
	Optional        bool
}
