package middlewares

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
	"github.com/gofiber/fiber/v2"
	"github.com/medama-io/go-useragent/agents"
	mileusna "github.com/mileusna/useragent"
)

func uaTryMileunsa(userAgent string) analytics.CourseViewsDeviceType {
	ua := mileusna.Parse(userAgent)
	switch {
	case ua.Desktop:
		return analytics.CourseViewsDeviceTypeDesktop
	case ua.Mobile:
		return analytics.CourseViewsDeviceTypeMobile
	case ua.Tablet:
		return analytics.CourseViewsDeviceTypeTablet
	default:
		return analytics.CourseViewsDeviceTypeOther
	}
}

func (self *MiddlewareService) uaTryMedama(userAgent string) analytics.CourseViewsDeviceType {
	ua := self.UserAgentParser.Parse(userAgent)

	switch ua.Device() {
	case agents.DeviceDesktop:
		return analytics.CourseViewsDeviceTypeDesktop
	case agents.DeviceMobile:
		return analytics.CourseViewsDeviceTypeMobile
	case agents.DeviceTablet:
		return analytics.CourseViewsDeviceTypeTablet
	case agents.DeviceTV:
		return analytics.CourseViewsDeviceTypeSmartTv
	default:
		return analytics.CourseViewsDeviceTypeOther
	}
}

func (self *MiddlewareService) GuessUADeviceType() fiber.Handler {
	return func(ctx *fiber.Ctx) error {
		userAgent := ctx.Get(fiber.HeaderUserAgent)
		if userAgent == "" {
			unknown := analytics.CourseViewsDeviceTypeOther
			ctx.Locals(localsMwDeviceType, &unknown)
			return ctx.Next()
		}

		deviceType := uaTryMileunsa(userAgent)
		if deviceType == analytics.CourseViewsDeviceTypeOther {
			deviceType = self.uaTryMedama(userAgent)
		}

		ctx.Locals(localsMwDeviceType, &deviceType)
		return ctx.Next()
	}
}
