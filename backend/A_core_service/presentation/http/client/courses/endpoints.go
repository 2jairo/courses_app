package courses

import (
	"fmt"

	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	coursepermissions "github.com/2jairo/courses_app/backend/A_core_service/application/services/coursePermissions"
	courseprogress "github.com/2jairo/courses_app/backend/A_core_service/application/services/courseProgress"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/middlewares"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
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
	ua := self.Services.Middleware.GuessUADeviceType()

	r.Get("/", optionalAuth, self.FindCourses)
	r.Get("/watch/:courseSlug", optionalAuth, ua, self.WatchCourse)
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

	deviceType := self.Services.Middleware.GetUADeviceType(ctx)
	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	permissions, _ := self.Services.CoursePermissions.GetUserPermissions(
		coursepermissions.HasRoleInput{
			CourseId:      course.ID,
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleRead,
			Optional:      true,
		},
	)

	var userId *entitycommon.Id = nil
	var userSex *entity.UserSex = nil
	if userJwtClaims != nil {
		userId = (*entitycommon.Id)(&userJwtClaims.UserId)
		userSex = (*entity.UserSex)(&userJwtClaims.Analytics.Sex)
	}

	view := &analytics.CourseViewsRaw{
		CourseID:   course.ID,
		Device:     *deviceType,
		UserID:     userId,
		ViewSource: analytics.CourseViewsSourceDirect, //TODO
		UserSex:    userSex,
		Seen:       false,
	}
	// self.Services.Course.Repo.Analytics.CreateView(view)
	fmt.Printf("view: %v\n", view)

	progress := courseprogress.NewCourseProgressWrapper([]entity.CourseProgress{})

	if userJwtClaims != nil {
		progress, _ = self.Services.CourseProgress.GetUserCourseProgress(
			course.ID,
			entitycommon.Id(userJwtClaims.UserId),
		)
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(course, progress, permissions))
}
