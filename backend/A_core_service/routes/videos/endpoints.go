package videos

import (
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

type VideosEndpoints struct {
	State *state.AppState
}

func (self *VideosEndpoints) RegisterRoutes(r fiber.Router) {
	r.Post("/", self.State.AuthMiddleware.ClientAuth(), self.CreateVideo)
}

func (self *VideosEndpoints) CreateVideo(ctx *fiber.Ctx) error {
	return nil
}
