package middlewares

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/ipinfo/go/v2/ipinfo"
	"github.com/medama-io/go-useragent"
)

const (
	localsMwJwtClaims = iota
	localsMwDeviceType
	localsGeoLocate
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

func (self *MiddlewareService) GetUADeviceType(ctx *fiber.Ctx) *entitycommon.DeviceType {
	resp, ok := ctx.Locals(localsMwDeviceType).(*entitycommon.DeviceType)
	if ok {
		return resp
	}
	return nil
}

func (self *MiddlewareService) GetGeoLocated(ctx *fiber.Ctx) *ipinfo.Core {
	resp, ok := ctx.Locals(localsGeoLocate).(*ipinfo.Core)
	if ok {
		return resp
	}
	return nil
}
