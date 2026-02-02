package courseprogress

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CourseProgressEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *CourseProgressEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())
	r.Put("/progress", self.UpdateCourseProgress)
}

func (self *CourseProgressEndpoints) UpdateCourseProgress(ctx *fiber.Ctx) error {
	// req := &UpdateCourseProgressRequest{}
	// if err := req.bind(self.State, ctx); err != nil {
	// 	return err
	// }

	// userJwtClaims := ctx.Locals(middleware.LocalsMwJwtClaims).(*utils.ClientJwtClaims)

	// progress := &entity.CourseProgress{
	// 	UserID:            userJwtClaims.UserId,
	// 	CourseID:          req.Body.CourseID,
	// 	LastLectureID:     req.Body.LastLectureID,
	// 	CompletedLectures: req.Body.CompletedLectures,
	// }

	// if err := self.State.CourseProgressRepository.Update(progress, progress); err != nil {
	// 	return err
	// }

	return ctx.SendStatus(fiber.StatusOK)
}
