package lectures

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/course"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/lecture"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type LecturesEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *LecturesEndpoints) RegisterRoutes(r fiber.Router) {
	auth := self.Services.Middleware.ClientAuth()

	r.Get("/play/:lectureSlug", auth, self.GetLecture)
}

func (self *LecturesEndpoints) GetLecture(ctx *fiber.Ctx) error {
	c := &GetLectureRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	output, err := self.Services.Lecture.GetLecture(
		lecture.GetLectureInput{
			LectureSlug: entitycommon.Slug{Slug: c.Params.LectureSlug},
			UserId:      utils.Ref(entitycommon.Id(userJwtClaims.UserId)),
		},
	)
	if err != nil {
		return err
	}

	courseID := output.Lecture.CourseSection.CourseID

	progress, _ := self.Services.CourseProgress.GetUserCourseProgress(
		courseID,
		entitycommon.Id(userJwtClaims.UserId),
	)

	course, err := self.Services.Course.GetCourseWithSectionsAndLectures(
		course.GetCourseWithSectionsAndLecturesInput{CourseId: courseID},
	)
	if err != nil {
		return err
	}

	blockedLectures := progress.ComputeBlockedLectures(course.LectureAccesibility, course.Sections)
	if blockedLectures[output.Lecture.ID] {
		return &localerror.LocalError{Err: localerror.ErrKindLectureBlocked, Status: fiber.StatusForbidden}
	}

	return ctx.Status(200).JSON(c.getResponse(
		output.Lecture,
		output.LectureData,
		output.LectureExtraData,
		progress,
	))
}
