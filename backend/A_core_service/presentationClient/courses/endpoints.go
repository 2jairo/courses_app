package courses

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/middleware"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/2jairo/courses_app/backend/A_core_service/wrappers"
	"github.com/gofiber/fiber/v2"
)

type CoursesEndpoints struct {
	State *state.AppState
}

func (self *CoursesEndpoints) RegisterRoutes(r fiber.Router) {
	optionalAuth := self.State.AuthMiddleware.ClientAuth(middleware.ClientAuthParams{Optional: true})

	r.Get("/", optionalAuth, self.FindCourses)
	r.Get("/watch/:courseSlug", optionalAuth, self.WatchCourse)
}

func (self *CoursesEndpoints) FindCourses(ctx *fiber.Ctx) error {
	c := &FindCoursesRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	courses, err := self.State.CourseRepository.FindCoursesWithPrefix(
		&entity.Course{Visibility: entity.CourseVisibilityPublic},
		entity.CoursePreloadOptions{},
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
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	course := &entity.Course{Slug: entitycommon.Slug{Slug: c.Params.CourseSlug}}
	preload := entity.CoursePreloadOptions{
		Sections: true,
		CourseSectionPreloadOptions: entity.CourseSectionPreloadOptions{
			Lectures: true,
		},
		Files: true,
	}
	err := self.State.CourseRepository.FindOne(course, preload)
	if err != nil {
		return err
	}

	progress := []entity.CourseProgress{}
	if userJwtClaims, ok := ctx.Locals(middleware.LocalsMwJwtClaims).(*utils.ClientJwtClaims); ok {
		progress, _ = self.State.CourseProgressRepository.Find(
			&entity.CourseProgress{UserID: userJwtClaims.UserId, CourseID: course.ID},
		)
	}

	progressWrapper := wrappers.NewCourseProgressWrapper(progress)
	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(course, progressWrapper))
}
