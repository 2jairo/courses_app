package middlewares

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

const (
	localsMwJwtClaims = iota
	localsMwCoursePermissions
)

type MiddlewareService struct {
	Repo  *infrastructure.AppRepositories
	Utils *utils.AppUtils
}

func (self *MiddlewareService) GetClientJwtClaims(ctx *fiber.Ctx) *utils.ClientJwtClaims {
	resp, ok := ctx.Locals(localsMwJwtClaims).(*utils.ClientJwtClaims)
	if ok {
		return resp
	}
	return nil
}

func (self *MiddlewareService) GetClientCoursePermissions(ctx *fiber.Ctx) *entity.CoursePermissions {
	resp, ok := ctx.Locals(localsMwCoursePermissions).(*entity.CoursePermissions)
	if ok {
		return resp
	}
	return nil
}
