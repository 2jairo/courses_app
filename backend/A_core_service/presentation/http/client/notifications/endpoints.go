package notifications

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/notifications"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type NotificationsEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *NotificationsEndpoints) RegisterRoutes(r fiber.Router) {
	requiredAuth := self.Services.Middleware.ClientAuth()

	r.Get("/", requiredAuth, self.GetNotifications)
	r.Post("/mark-as-seen", requiredAuth, self.MarkAllAsSeen)
}

func (self *NotificationsEndpoints) GetNotifications(ctx *fiber.Ctx) error {
	c := &GetNofificationsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)

	n, err := self.Services.Notifications.GetUserNotifications(
		notifications.GetUserNotificationsInput{
			UserID: entitycommon.Id(userJwtClaims.UserId),
		},
	)
	if err != nil {
		return global.Err(err)
	}

	return ctx.Status(200).JSON(c.getResponse(n))
}

func (self *NotificationsEndpoints) MarkAllAsSeen(ctx *fiber.Ctx) error {
	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)

	if err := self.Services.Notifications.MarkNotificationsAsSeen(
		notifications.MarkNotificationsAsSeenInput{
			UserID: entitycommon.Id(userJwtClaims.UserId),
		},
	); err != nil {
		return global.Err(err)
	}

	return ctx.SendStatus(fiber.StatusOK)
}
