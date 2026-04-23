package notifications

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type NotificationResponse struct {
	NotificationType entity.NotificationType `json:"notificationType"`
	Seen             bool                     `json:"seen"`
	SeenAt           *time.Time               `json:"seenAt,omitempty"`
	Metadata         any                      `json:"metadata,omitempty"`
	Actor            *utils.UserResponse      `json:"actor,omitempty"`
}

func (self *GetNofificationsRequest) getResponse(n []entity.Notification) []NotificationResponse {
	resp := make([]NotificationResponse, len(n))
	for i, noti := range n {

		var actor *utils.UserResponse = nil
		if noti.Actor != nil {
			var actorAvatar *string = nil
			if noti.Actor.Avatar != nil {
				actorAvatar = utils.Ref(noti.Actor.Avatar.CdnImageUrl())
			}
			actor = &utils.UserResponse{
				Username: noti.Actor.Username,
				Avatar:   actorAvatar,
			}
		}

		resp[i] = NotificationResponse{
			NotificationType: noti.NotificationType,
			Seen:             noti.Seen,
			SeenAt:           noti.SeenAt,
			Metadata:         noti.Metadata,
			Actor:            actor,
		}
	}

	return resp
}
