package courses

import (
	"fmt"

	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	courseprogress "github.com/2jairo/courses_app/backend/A_core_service/application/services/courseProgress"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/middlewares"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CoursesEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *CoursesEndpoints) RegisterRoutes(r fiber.Router) {
	optionalAuth := self.Services.Middleware.ClientAuth(middlewares.ClientAuthParams{Optional: true})

	r.Get("/", optionalAuth, self.FindCourses)
	r.Get("/watch/:courseSlug", optionalAuth, self.WatchCourse)
}

func (self *CoursesEndpoints) FindCourses(ctx *fiber.Ctx) error {
	c := &FindCoursesRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	courses, err := self.Services.Course.FindPublicCourses(
		&c.Query.Pagination,
		c.Query.QueryByTitle,
	)
	if err != nil {
		return err
	}

	ctx.Status(200).JSON(c.getResponse(courses))
	return nil
}

func (self *CoursesEndpoints) WatchCourse(ctx *fiber.Ctx) error {
	c := &WatchCourseRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	course, err := self.Services.Course.WatchCourse(entitycommon.Slug{Slug: c.Params.CourseSlug})
	if err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	progress := courseprogress.NewCourseProgressWrapper([]entity.CourseProgress{})
	fmt.Printf("userJwtClaims: %v\n", userJwtClaims)

	if userJwtClaims != nil {
		progress, _ = self.Services.CourseProgress.GetUserCourseProgress(
			course.ID,
			entitycommon.Id(userJwtClaims.UserId),
		)
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(course, progress))
}
