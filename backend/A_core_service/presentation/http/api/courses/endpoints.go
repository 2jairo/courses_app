package courses

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/course"
	coursepermissions "github.com/2jairo/courses_app/backend/A_core_service/application/services/coursePermissions"
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
	r.Use(self.Services.Middleware.ClientAuth())

	r.Post("/create", self.CreateCourse)
	r.Get("/", self.GetCourses)
	r.Get("/:courseId", self.GetCourseDetails) // Read
	r.Put("/:courseId", self.UpdateCourse)     // Write
	r.Delete("/:courseId", self.DeleteCourse)  // Owner
}

func (self *CoursesEndpoints) CreateCourse(ctx *fiber.Ctx) error {
	courseEntity := &entity.Course{}
	c := &CreateCourseRequest{}
	if err := c.bind(self.Utils, ctx, courseEntity); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	output, err := self.Services.Course.CreateCourse(
		course.CreateCourseInput{
			Course: courseEntity,
			UserId: entitycommon.Id(userJwtClaims.UserId),
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(fiber.StatusCreated).JSON(c.getResponse(output.Course, output.Permissions))
}

func (self *CoursesEndpoints) GetCourses(ctx *fiber.Ctx) error {
	c := &GetDashboardCourses{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	withPermissions, err := self.Services.Course.GetCoursesWithPermissions(
		course.GetCoursesWithPermissionsInput{
			UserId: entitycommon.Id(userJwtClaims.UserId),
			Preload: entity.CoursePermissionsPreloadOptions{
				Course: true,
			},
			Pagination:   &c.Query.Pagination,
			QueryByTitle: c.Query.QueryByTitle,
		},
	)
	if err != nil {
		return err
	}

	ctx.Status(200).JSON(c.getResponse(withPermissions))
	return nil
}

func (self *CoursesEndpoints) GetCourseDetails(ctx *fiber.Ctx) error {
	c := &GetCourseDetailsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	permissions, err := self.Services.CoursePermissions.GetUserPermissions(
		coursepermissions.HasRoleInput{
			CourseId:      entitycommon.Id(c.CourseId),
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleRead,
		},
	)
	if err != nil {
		return err
	}

	course, err := self.Services.Course.GetCourseDetails(
		course.GetCourseDetailsInput{CourseId: entitycommon.Id(c.CourseId)},
	)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(course, permissions))
}

func (self *CoursesEndpoints) UpdateCourse(ctx *fiber.Ctx) error {
	c := &UpdateCourseRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	permissions, err := self.Services.CoursePermissions.GetUserPermissions(
		coursepermissions.HasRoleInput{
			CourseId:      entitycommon.Id(c.Params.CourseId),
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleRead,
		},
	)
	if err != nil {
		return err
	}

	updated, err := self.Services.Course.UpdateCourse(
		course.UpdateCourseInput{
			CourseId:            entitycommon.Id(c.Params.CourseId),
			Title:               c.Body.Title,
			Description:         c.Body.Description,
			PosterFileId:        (*entitycommon.Id)(c.Body.PosterFileId),
			Visibility:          c.Body.Visibility,
			LectureAccesibility: c.Body.LectureAccesibility,
			Language:            c.Body.Language,
			Price:               c.Body.Price,
			DiscountPercent:     c.Body.DiscountPercent,
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(updated, permissions))
}

func (self *CoursesEndpoints) DeleteCourse(ctx *fiber.Ctx) error {
	c := &DeleteCourseRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRole(
		coursepermissions.HasRoleInput{
			CourseId:      entitycommon.Id(c.CourseId),
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleOwner,
		},
	); err != nil {
		return err
	}

	err := self.Services.Course.DeleteCourse(
		course.DeleteCourseInput{CourseId: entitycommon.Id(c.CourseId)},
	)
	if err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}
