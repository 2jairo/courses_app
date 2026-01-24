package coursesections

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CourseSectionsEndpoints struct {
	State *state.AppState
}

func (self *CourseSectionsEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.State.AuthMiddleware.ClientAuth())
	canWrite := self.State.CourseRoleMiddleware.HasRole(entity.CoursePermissionsRoleWrite)

	r.Post("/create", canWrite, self.CreateCourseSection)
	r.Put("/:sectionId", canWrite, self.UpdateCourseSection)
	r.Put("/:sectionId/position", canWrite, self.UpdateCourseSectionPosition)
	r.Delete("/:sectionId", canWrite, self.DeleteCourseSection)
}

func (self *CourseSectionsEndpoints) CreateCourseSection(ctx *fiber.Ctx) error {
	c := &CreateCourseSectionRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	course := &entity.Course{Model: entitycommon.Model{ID: c.Body.CourseId}}
	preload := entity.CoursePreloadOptions{Sections: true}
	if err := self.State.CourseRepository.FindOne(course, preload); err != nil {
		return err
	}
	// if course.UpdatedAt.Compare(c.CourseUpdatedAt) != 0 {
	// 	return &localerror.LocalError{Err: localerror.ErrKindConflict, Status: fiber.StatusConflict}
	// }

	courseSection := &entity.CourseSection{
		CourseID: course.ID,
		Position: len(course.Sections) + 1,
		Title:    c.Body.Title,
	}
	if err := self.State.CourseSectionRepository.Create(courseSection); err != nil {
		return err
	}

	// updatedAtCourse, err := self.State.CourseRepository.Update(
	// 	&entity.Course{Model: entitycommon.Model{ID: c.CourseId}},
	// 	&entity.Course{},
	// )
	// if err != nil {
	// 	return err
	// }

	return ctx.Status(fiber.StatusCreated).JSON(c.getResponse(courseSection))
}

func (self *CourseSectionsEndpoints) UpdateCourseSection(ctx *fiber.Ctx) error {
	c := &UpdateCourseSectionRequest{}
	section := &entity.CourseSection{}

	if err := c.bind(self.State, ctx, section); err != nil {
		return err
	}

	findBy := &entity.CourseSection{Model: entitycommon.Model{ID: c.Params.SectionId}}
	updated, err := self.State.CourseSectionRepository.Update(findBy, section)
	if err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(updated))
}

func (self *CourseSectionsEndpoints) DeleteCourseSection(ctx *fiber.Ctx) error {
	c := &DeleteCourseSectionRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	section := &entity.CourseSection{Model: entitycommon.Model{ID: c.Params.SectionId}}
	preload := entity.CourseSectionPreloadOptions{
		Lectures: true,
		LecturePreloadOptions: entity.LecturePreloadOptions{
			Assets: true,
		},
	}
	if err := self.State.CourseSectionRepository.FindOne(section, preload); err != nil {
		return err
	}

	if err := self.State.CourseSectionRepository.Delete(section); err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}

func (self *CourseSectionsEndpoints) UpdateCourseSectionPosition(ctx *fiber.Ctx) error {
	c := &UpdateCourseSectionPositionRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	course := &entity.Course{Model: entitycommon.Model{ID: c.Body.CourseId}}
	coursePreload := entity.CoursePreloadOptions{Sections: true}
	if err := self.State.CourseRepository.FindOne(course, coursePreload); err != nil {
		return err
	}

	sections := course.Sections

	// Find current section and its old position
	oldPosition := -1
	for _, s := range sections {
		if s.ID == c.Params.SectionId {
			oldPosition = s.Position
			break
		}
	}
	if oldPosition == -1 {
		return &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}
	if oldPosition == c.Body.Position {
		ctx.Status(fiber.StatusOK)
		return nil
	}

	newPos := c.Body.Position
	if oldPosition < newPos {
		// moving position down
		for i := range sections {
			if sections[i].Position > oldPosition && sections[i].Position <= newPos {
				sections[i].Position--
			}
		}
	} else {
		// moving position up
		for i := range sections {
			if sections[i].Position >= newPos && sections[i].Position < oldPosition {
				sections[i].Position++
			}
		}
	}

	// Update the target section
	newPositions := make([]utils.Positions, len(sections))
	for i, s := range sections {
		if s.ID == c.Params.SectionId {
			newPositions[i] = utils.Positions{ID: s.ID, Position: newPos}
		} else {
			newPositions[i] = utils.Positions{ID: s.ID, Position: s.Position}
		}
	}

	// Save all updated sections
	if err := self.State.CourseSectionRepository.UpdatePositions(newPositions); err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}
