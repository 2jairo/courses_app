package middlewares

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/gofiber/fiber/v2"
)

func (self *MiddlewareService) HasRole(minRole entity.CoursePermissionsRole) fiber.Handler {
	return func(ctx *fiber.Ctx) error {
		userJwtClaims := self.GetClientJwtClaims(ctx)

		userPermissions := &entity.CoursePermissions{UserID: entitycommon.Id(userJwtClaims.UserId)}
		preload := entity.CoursePermissionsPreloadOptions{}

		err := self.Repo.CoursePermissions.FindOne(userPermissions, preload)
		if err != nil || !userPermissions.Role.HasRole(minRole) {
			return &localerror.LocalError{Err: localerror.ErrKindForbidden, Status: fiber.StatusForbidden}
		}

		ctx.Locals(localsMwCoursePermissions, userPermissions)
		return ctx.Next()
	}
}
