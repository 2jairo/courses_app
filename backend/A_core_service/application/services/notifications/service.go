package notifications

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
)

type NotificationsService struct {
	Repo *infrastructure.AppRepositories
}

func (s *NotificationsService) GetUserNotifications(input GetUserNotificationsInput) ([]entity.Notification, error) {
	return s.Repo.Notification.Find(
		&entity.Notification{UserID: input.UserID},
		entity.NotificationPreloadOptions{
			Actor: true,
		},
		input.Pagination,
	)
}

func (s *NotificationsService) MarkNotificationsAsSeen(input MarkNotificationsAsSeenInput) error {
	_, err := s.Repo.Notification.UpdateMultiple(
		&entity.Notification{UserID: input.UserID, Seen: false},
		&entity.Notification{Seen: true, SeenAt: utils.Ref(time.Now())},
	)

	return global.Err(err)
}
