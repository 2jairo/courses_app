package middlewares

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/gofiber/fiber/v2"
	"github.com/medama-io/go-useragent/agents"
	mileusna "github.com/mileusna/useragent"
)

func uaTryMileunsa(userAgent string) entitycommon.DeviceType {
	ua := mileusna.Parse(userAgent)
	switch {
	case ua.Desktop:
		return entitycommon.DeviceTypeDesktop
	case ua.Mobile:
		return entitycommon.DeviceTypeMobile
	case ua.Tablet:
		return entitycommon.DeviceTypeTablet
	default:
		return entitycommon.DeviceTypeOther
	}
}

func (self *MiddlewareService) uaTryMedama(userAgent string) entitycommon.DeviceType {
	ua := self.UserAgentParser.Parse(userAgent)

	switch ua.Device() {
	case agents.DeviceDesktop:
		return entitycommon.DeviceTypeDesktop
	case agents.DeviceMobile:
		return entitycommon.DeviceTypeMobile
	case agents.DeviceTablet:
		return entitycommon.DeviceTypeTablet
	case agents.DeviceTV:
		return entitycommon.DeviceTypeSmartTv
	default:
		return entitycommon.DeviceTypeOther
	}
}

func (self *MiddlewareService) GuessUADeviceType() fiber.Handler {
	return func(ctx *fiber.Ctx) error {
		userAgent := ctx.Get(fiber.HeaderUserAgent)
		if userAgent == "" {
			unknown := entitycommon.DeviceTypeOther
			ctx.Locals(localsMwDeviceType, &unknown)
			return ctx.Next()
		}

		deviceType := uaTryMileunsa(userAgent)
		if deviceType == entitycommon.DeviceTypeOther {
			deviceType = self.uaTryMedama(userAgent)
		}

		ctx.Locals(localsMwDeviceType, &deviceType)
		return ctx.Next()
	}
}
