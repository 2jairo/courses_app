package lectures

import (
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

type LecturesEndpoints struct {
	State *state.AppState
}

func (self *LecturesEndpoints) RegisterRoutes(r fiber.Router) {
}
