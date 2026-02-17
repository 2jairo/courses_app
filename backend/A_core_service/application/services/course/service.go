package course

import (
	"encoding/json"
	"fmt"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type CourseService struct {
	Repo *infrastructure.AppRepositories
}

// CreateCourse creates a new course and assigns ownership permissions to the user
func (s *CourseService) CreateCourse(course *entity.Course, userId entitycommon.Id) (*entity.Course, *entity.CoursePermissions, error) {
	if err := s.Repo.Course.Create(course); err != nil {
		return nil, nil, err
	}

	permissions := &entity.CoursePermissions{
		UserID:   userId,
		CourseID: course.ID,
		Role:     entity.CoursePermissionsRoleOwner,
	}
	if err := s.Repo.CoursePermissions.Create(permissions); err != nil {
		return nil, nil, err
	}

	return course, permissions, nil
}

// GetCoursesWithPermissions retrieves courses with their permissions for a user
func (s *CourseService) GetCoursesWithPermissions(
	userId entitycommon.Id,
	preload entity.CoursePermissionsPreloadOptions,
	pagination *utils.Pagination,
	queryByTitle string,
) ([]entity.CoursePermissions, error) {
	return s.Repo.CoursePermissions.FindCoursesWithPrefix(userId, preload, pagination, queryByTitle)
}

// GetCourseDetails retrieves a course with all its sections and lectures
func (s *CourseService) GetCourseDetails(courseId entitycommon.Id) (*entity.Course, error) {
	course := &entity.Course{Model: entitycommon.Model{ID: courseId}}
	preload := entity.CoursePreloadOptions{
		Sections: true,
		CourseSectionPreloadOptions: entity.CourseSectionPreloadOptions{
			Lectures: true,
		},
	}
	if err := s.Repo.Course.FindOne(course, preload); err != nil {
		return nil, err
	}

	return course, nil
}

// UpdateCourse updates an existing course
func (s *CourseService) UpdateCourse(input UpdateCourseInput) (*entity.Course, error) {
	course := &entity.Course{}
	if input.Title != nil {
		course.Title = *input.Title
	}
	if input.Description != nil {
		course.Description = *input.Description
	}
	if input.Visibility != nil {
		course.Visibility = *input.Visibility
	}
	if input.Language != nil {
		course.Language = *input.Language
	}

	var selectColumns []string
	if input.PosterFileId != nil && *input.PosterFileId < 0 {
		course.Poster = nil
		selectColumns = append(selectColumns, "poster")
	} else if input.PosterFileId != nil && *input.PosterFileId > 0 {
		file := &entity.File{
			Kind:     entity.FileKindImage,
			Status:   entity.FileStatusReady,
			CourseID: input.CourseId,
			Model:    entitycommon.Model{ID: *input.PosterFileId},
		}
		if err := s.Repo.File.FindOne(file, entity.FilePreloadOptions{}); err != nil {
			return nil, err
		}

		metadata := &entity.FileMetadataKindImage{}
		if err := json.Unmarshal(file.Metadata, metadata); err != nil {
			return nil, err
		}
		res := metadata.ChooseClosestImageResolution(entity.FileMetadataKindImageResolutionVariantLarge)

		path := fmt.Sprint(file.ID) + "/" + res.Path
		course.Poster = (*entitycommon.Path)(&path)
	}

	updateBy := &entity.Course{Model: entitycommon.Model{ID: input.CourseId}}
	updated, err := s.Repo.Course.Update(updateBy, course, selectColumns...)
	if err != nil {
		return nil, err
	}

	return updated, nil
}

// DeleteCourse deletes a course and all its related data
func (s *CourseService) DeleteCourse(courseId entitycommon.Id) error {
	course := &entity.Course{Model: entitycommon.Model{ID: courseId}}
	preload := entity.CoursePreloadOptions{
		Sections: true,
		CourseSectionPreloadOptions: entity.CourseSectionPreloadOptions{
			Lectures: true,
			LecturePreloadOptions: entity.LecturePreloadOptions{
				Assets: true,
			},
		},
		Permissions: true,
	}
	if err := s.Repo.Course.FindOne(course, preload); err != nil {
		return err
	}

	if err := s.Repo.Course.Delete(course); err != nil {
		return err
	}

	return nil
}

// FindPublicCourses retrieves public courses with optional filtering and pagination
func (s *CourseService) FindPublicCourses(
	pagination *utils.Pagination,
	queryByTitle string,
) ([]entity.Course, error) {
	return s.Repo.Course.FindCoursesWithPrefix(
		&entity.Course{Visibility: entity.CourseVisibilityPublic},
		entity.CoursePreloadOptions{},
		pagination,
		queryByTitle,
	)
}

// WatchCourse retrieves a course with its sections, lectures, and files for viewing
func (s *CourseService) WatchCourse(courseSlug entitycommon.Slug) (*entity.Course, error) {
	course := &entity.Course{Slug: courseSlug}
	preload := entity.CoursePreloadOptions{
		Sections: true,
		CourseSectionPreloadOptions: entity.CourseSectionPreloadOptions{
			Lectures: true,
			LecturePreloadOptions: entity.LecturePreloadOptions{
				Assets: true,
				LectureAssetPreloadOptions: entity.LectureAssetPreloadOptions{
					File: true,
				},
			},
		},
	}
	if err := s.Repo.Course.FindOne(course, preload); err != nil {
		return nil, err
	}

	return course, nil
}

func (s *CourseService) GetCourseFromSectionId(courseId entitycommon.Id) (*entity.Course, error) {
	course := &entity.Course{Model: entitycommon.Model{ID: courseId}}
	err := s.Repo.Course.FindOne(course, entity.CoursePreloadOptions{})
	return course, err
}
