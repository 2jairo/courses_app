package coursesections

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

type CourseSectionsEndpoints struct {
	State *state.AppState
}

func (self *CourseSectionsEndpoints) RegisterRoutes(r fiber.Router) {
	r.Post("/create", self.State.AuthMiddleware.ClientAuth(), self.CreateCourseSection)
	r.Delete("/:sectionSlug", self.State.AuthMiddleware.ClientAuth(), self.DeleteCourseSection)
}

func (self *CourseSectionsEndpoints) CreateCourseSection(ctx *fiber.Ctx) error {
	c := &CreateCourseSectionRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	course := &entity.Course{Slug: entity.Slug{Slug: c.CourseSlug}}
	preload := entity.CoursePreloadOptions{Sections: true}
	if err := self.State.CourseRepository.FindOne(course, preload); err != nil {
		return err
	}
	if course.UpdatedAt.Compare(c.CourseUpdatedAt) != 0 {
		return &localerror.LocalError{Err: localerror.ErrKindConflict, Status: fiber.StatusConflict}
	}

	courseSection := &entity.CourseSection{
		CourseID: course.ID,
		Position: len(course.Sections) + 1,
		Title:    c.Title,
	}
	if err := self.State.CourseSectionRepository.Create(courseSection); err != nil {
		return err
	}

	updatedAtCourse, err := self.State.CourseRepository.Update(
		&entity.Course{Slug: entity.Slug{Slug: c.CourseSlug}},
		&entity.Course{},
	)
	if err != nil {
		return err
	}

	return ctx.Status(fiber.StatusCreated).JSON(c.getResponse(courseSection, updatedAtCourse.UpdatedAt))
}

func (self *CourseSectionsEndpoints) DeleteCourseSection(ctx *fiber.Ctx) error {
	c := &DeleteCourseSectionRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	section := &entity.CourseSection{Slug: entity.Slug{Slug: c.SectionSlug}}
	preload := entity.CourseSectionPreloadOptions{}
	if err := self.State.CourseSectionRepository.FindOne(section, preload); err != nil {
		return err
	}

	if err := self.State.CourseSectionRepository.Delete(section); err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}
