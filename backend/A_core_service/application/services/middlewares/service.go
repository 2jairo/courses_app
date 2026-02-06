package middlewares

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/medama-io/go-useragent"
)

const (
	localsMwJwtClaims = iota
	localsMwDeviceType
)

type MiddlewareService struct {
	Repo            *infrastructure.AppRepositories
	Utils           *utils.AppUtils
	UserAgentParser *useragent.Parser
}

func (self *MiddlewareService) GetClientJwtClaims(ctx *fiber.Ctx) *utils.ClientJwtClaims {
	resp, ok := ctx.Locals(localsMwJwtClaims).(*utils.ClientJwtClaims)
	if ok {
		return resp
	}
	return nil
}

func (self *MiddlewareService) GetUADeviceType(ctx *fiber.Ctx) *analytics.CourseViewsDeviceType {
	resp, ok := ctx.Locals(localsMwDeviceType).(*analytics.CourseViewsDeviceType)
	if ok {
		return resp
	}
	return nil
}
