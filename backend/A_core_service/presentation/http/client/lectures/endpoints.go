package lectures

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	courseprogress "github.com/2jairo/courses_app/backend/A_core_service/application/services/courseProgress"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/lecture"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/middlewares"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type LecturesEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *LecturesEndpoints) RegisterRoutes(r fiber.Router) {
	optionalAuth := self.Services.Middleware.ClientAuth(middlewares.ClientAuthParams{Optional: true})

	r.Get("/play/:lectureSlug", optionalAuth, self.GetLecture)
}

func (self *LecturesEndpoints) GetLecture(ctx *fiber.Ctx) error {
	c := &GetLectureRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	output, err := self.Services.Lecture.GetLecture(
		lecture.GetLectureInput{
			LectureSlug: entitycommon.Slug{Slug: c.Params.LectureSlug},
		},
	)
	if err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	progress := courseprogress.NewCourseProgressWrapper([]entity.CourseProgress{})

	if userJwtClaims != nil {
		progress, _ = self.Services.CourseProgress.GetUserCourseLectureProgress(
			output.Lecture.CourseSection.CourseID,
			entitycommon.Id(userJwtClaims.UserId),
			output.Lecture.ID,
		)
	}

	return ctx.Status(200).JSON(c.getResponse(
		output.Lecture,
		output.LectureData,
		progress,
	))
}
