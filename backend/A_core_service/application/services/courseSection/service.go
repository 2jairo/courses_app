package coursesection

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CourseSectionService struct {
	Repo *infrastructure.AppRepositories
}

// CreateCourseSection creates a new section in a course
func (s *CourseSectionService) CreateCourseSection(courseId entitycommon.Id, title string) (*entity.CourseSection, error) {
	course := &entity.Course{Model: entitycommon.Model{ID: courseId}}
	preload := entity.CoursePreloadOptions{Sections: true}
	if err := s.Repo.Course.FindOne(course, preload); err != nil {
		return nil, err
	}

	courseSection := &entity.CourseSection{
		CourseID: course.ID,
		Position: len(course.Sections) + 1,
		Title:    title,
	}
	if err := s.Repo.CourseSection.Create(courseSection); err != nil {
		return nil, err
	}

	return courseSection, nil
}

// UpdateCourseSection updates an existing course section
func (s *CourseSectionService) UpdateCourseSection(sectionId entitycommon.Id, updates *entity.CourseSection) (*entity.CourseSection, error) {
	findBy := &entity.CourseSection{Model: entitycommon.Model{ID: sectionId}}
	updated, err := s.Repo.CourseSection.Update(findBy, updates)
	return updated, err
}

// DeleteCourseSection deletes a course section and all its related data
func (s *CourseSectionService) DeleteCourseSection(sectionId entitycommon.Id) error {
	section := &entity.CourseSection{Model: entitycommon.Model{ID: sectionId}}
	preload := entity.CourseSectionPreloadOptions{
		Lectures: true,
		LecturePreloadOptions: entity.LecturePreloadOptions{
			Assets: true,
		},
	}
	if err := s.Repo.CourseSection.FindOne(section, preload); err != nil {
		return err
	}

	if err := s.Repo.CourseSection.Delete(section); err != nil {
		return err
	}

	return nil
}

// UpdateCourseSectionPosition updates the position of a section within a course
func (s *CourseSectionService) UpdateCourseSectionPosition(sectionId entitycommon.Id, courseId entitycommon.Id, newPosition int) error {
	course := &entity.Course{Model: entitycommon.Model{ID: courseId}}
	coursePreload := entity.CoursePreloadOptions{Sections: true}
	if err := s.Repo.Course.FindOne(course, coursePreload); err != nil {
		return err
	}

	sections := course.Sections

	// Find current section and its old position
	oldPosition := -1
	for _, section := range sections {
		if section.ID == sectionId {
			oldPosition = section.Position
			break
		}
	}
	if oldPosition == -1 {
		return &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}
	if oldPosition == newPosition {
		return nil
	}

	// Adjust positions
	if oldPosition < newPosition {
		// moving position down
		for i := range sections {
			if sections[i].Position > oldPosition && sections[i].Position <= newPosition {
				sections[i].Position--
			}
		}
	} else {
		// moving position up
		for i := range sections {
			if sections[i].Position >= newPosition && sections[i].Position < oldPosition {
				sections[i].Position++
			}
		}
	}

	// Update the target section
	newPositions := make([]utils.Positions, len(sections))
	for i, section := range sections {
		if section.ID == sectionId {
			newPositions[i] = utils.Positions{ID: int64(section.ID), Position: newPosition}
		} else {
			newPositions[i] = utils.Positions{ID: int64(section.ID), Position: section.Position}
		}
	}

	// Save all updated sections
	if err := s.Repo.CourseSection.UpdatePositions(newPositions); err != nil {
		return err
	}

	return nil
}
