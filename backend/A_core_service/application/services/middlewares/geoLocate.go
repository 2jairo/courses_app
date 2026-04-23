package middlewares

import (
	"net"

	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

func (self *MiddlewareService) GeoLocate() fiber.Handler {
	return func(c *fiber.Ctx) error {
		ip := c.Get(fiber.HeaderXForwardedFor)
		if ip == "" {
			ip = c.IP()
		}

		resp, err := self.Utils.IpInfo.GetIPInfo(net.ParseIP(ip))
		if err != nil {
			return global.Err(err)
		}

		c.Locals(localsGeoLocate, resp)
		return c.Next()
	}
}
