package courseprogress

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CourseProgressEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *CourseProgressEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())

	r.Post("/mark-as-seen", self.MarkAsSeen)
	r.Post("/reset", self.ResetCourseProgress)
}

func (self *CourseProgressEndpoints) MarkAsSeen(ctx *fiber.Ctx) error {
	req := &UpdateCourseProgressRequest{}
	if err := req.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CourseProgress.MarkAsSeen(
		entitycommon.Id(req.Body.CourseID),
		entitycommon.Id(userJwtClaims.UserId),
		entitycommon.Id(req.Body.LectureID),
	); err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}

func (self *CourseProgressEndpoints) ResetCourseProgress(ctx *fiber.Ctx) error {
	req := &ResetCourseProgressRequest{}
	if err := req.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CourseProgress.ResetCourseProgress(
		entitycommon.Id(req.Body.CourseID),
		entitycommon.Id(userJwtClaims.UserId),
	); err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}
