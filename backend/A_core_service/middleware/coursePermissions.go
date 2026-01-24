package middleware

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/repository"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CoursePermissionMiddleware struct {
	*repository.CoursePermissionsRepository
}

func (self *CoursePermissionMiddleware) HasRole(minRole entity.CoursePermissionsRole) fiber.Handler {
	return func(ctx *fiber.Ctx) error {
		userJwtClaims := ctx.Locals(LocalsMwJwtClaims).(*utils.ClientJwtClaims)

		userPermissions := &entity.CoursePermissions{UserID: userJwtClaims.UserId}
		preload := entity.CoursePermissionsPreloadOptions{}
		if err := self.CoursePermissionsRepository.FindOne(userPermissions, preload); err != nil {
			return err
		}
		if !userPermissions.Role.HasRole(minRole) {
			return &localerror.LocalError{Err: localerror.ErrKindForbidden, Status: fiber.StatusForbidden}
		}

		ctx.Locals(LocalsMwCoursePermissions, userPermissions)
		return ctx.Next()
	}
}
