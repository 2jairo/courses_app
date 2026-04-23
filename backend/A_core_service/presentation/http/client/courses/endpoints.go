package courses

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/analytics"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/course"
	coursepermissions "github.com/2jairo/courses_app/backend/A_core_service/application/services/coursePermissions"
	courseprogress "github.com/2jairo/courses_app/backend/A_core_service/application/services/courseProgress"
	coursepurchases "github.com/2jairo/courses_app/backend/A_core_service/application/services/coursePurchases"
	coursetags "github.com/2jairo/courses_app/backend/A_core_service/application/services/courseTags"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/middlewares"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
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
		return global.Err(err)
	}

	courses, err := self.Services.Course.FindPublicCourses(
		course.FindPublicCoursesInput{
			Pagination:   &c.Query.Pagination,
			QueryByTitle: c.Query.QueryByTitle,
		},
	)
	if err != nil {
		return global.Err(err)
	}

	ctx.Status(200).JSON(c.getResponse(courses))
	return nil
}

func (self *CoursesEndpoints) WatchCourse(ctx *fiber.Ctx) error {
	c := &WatchCourseRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)

	var userId *entitycommon.Id
	if userJwtClaims != nil {
		userId = (*entitycommon.Id)(&userJwtClaims.UserId)
	}

	output, err := self.Services.Course.WatchCourse(
		course.WatchCourseInput{
			CourseSlug: entitycommon.Slug{Slug: c.Params.CourseSlug},
			UserId:     userId,
		},
	)
	if err != nil {
		return global.Err(err)
	}

	tags, err := self.Services.CourseTags.GetCourseTags(
		coursetags.GetCourseTagsInput{CourseID: output.Course.ID},
	)
	if err != nil {
		return global.Err(err)
	}

	permissions, _ := self.Services.CoursePermissions.GetUserPermissions(
		coursepermissions.HasRoleInput{
			CourseId:      output.Course.ID,
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleRead,
			Optional:      true,
		},
	)

	progress := courseprogress.NewCourseProgressWrapper([]entity.CourseProgress{})

	if userJwtClaims != nil {
		progress, _ = self.Services.CourseProgress.GetUserCourseProgress(
			output.Course.ID,
			entitycommon.Id(userJwtClaims.UserId),
		)
	}

	purchase, _ := self.Services.CoursePurchases.FindOne(
		coursepurchases.FindOneInput{
			UserID:   entitycommon.Id(userJwtClaims.UserId),
			CourseID: output.Course.ID,
		},
	)

	stats, _ := self.Services.Analytics.GetCourseStats(
		analytics.GetCourseStatsInput{CourseID: output.Course.ID},
	)

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(
		output.Course,
		tags,
		output.IsFavorite,
		output.Owner,
		progress,
		permissions,
		purchase,
		stats,
	))
}
