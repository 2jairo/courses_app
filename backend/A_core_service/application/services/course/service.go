package course

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	typesenseentity "github.com/2jairo/courses_app/backend/A_core_service/entity/typesenseentity"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"gorm.io/gorm"
)

type CourseService struct {
	Repo *infrastructure.AppRepositories
}

func (s *CourseService) buildCourseTypesenseDocument(input SyncCourseInTypesenseInput) (*typesenseentity.CourseDocument, error) {
	courseID := input.CourseID
	if input.Course != nil && input.Course.ID != 0 {
		courseID = input.Course.ID
	}

	course := input.Course
	if course == nil {
		course = &entity.Course{Model: entitycommon.Model{ID: courseID}}
		preload := entity.CoursePreloadOptions{}
		if input.Tags == nil {
			preload.Tags = true
			preload.CourseTagPreloadOptions = entity.CourseTagPreloadOptions{Tag: true}
		}
		if err := s.Repo.Course.FindOne(course, preload); err != nil {
			return nil, global.Err(err)
		}
	}

	poster := ""
	if course.Poster != nil {
		poster = course.Poster.CdnImageUrl()
	}

	tagsRows := input.Tags
	if tagsRows == nil {
		tagsRows = course.Tags
	}

	tags := make([]string, len(tagsRows))
	for i, tag := range tagsRows {
		if tag.Tag != nil {
			tags[i] = tag.Tag.Name
		}
	}

	author := input.Author
	if author == nil {
		owner := &entity.CoursePermissions{CourseID: course.ID, Role: entity.CoursePermissionsRoleOwner}
		if err := s.Repo.CoursePermissions.FindOne(owner, entity.CoursePermissionsPreloadOptions{User: true}); err == nil {
			username := owner.User.Username
			author = &username
		}
	}

	stats := input.Stats
	if stats == nil {
		stats = &analytics.CourseStats{CourseID: int64(course.ID)}
		if err := s.Repo.Analytics.FindOneCourseStats(stats); err != nil && !errors.Is(gorm.ErrRecordNotFound, err) {
			return nil, global.Err(err)
		}
	}

	authorValue := ""
	if author != nil {
		authorValue = *author
	}

	return &typesenseentity.CourseDocument{
		ID:                  fmt.Sprint(course.ID),
		Slug:                course.Slug.Slug,
		UpdatedAt:           course.UpdatedAt.Unix(),
		LectureAccesibility: string(course.LectureAccesibility),
		Title:               course.Title,
		Description:         course.Description,
		Poster:              poster,
		Language:            string(course.Language),
		LecturesAmmount:     course.LecturesAmount,
		Price:               course.Price,
		DiscountedPrice:     course.DiscountedPrice(),
		DiscountPercent:     course.DiscountPercent,
		Tags:                tags,
		Author:              authorValue,
		AvgRating:           stats.AvgRating,
		TotalReviews:        int64(stats.TotalReviews),
		TotalPurchases:      int64(stats.TotalPurchases),
		TotalViews:          int64(stats.TotalViews),
		TotalImpressions:    int64(stats.TotalImpressions),
	}, nil
}

func (s *CourseService) SyncCourseInTypesense(input SyncCourseInTypesenseInput) error {
	doc, err := s.buildCourseTypesenseDocument(input)
	if err != nil {
		return global.Err(err)
	}
	return s.Repo.Course.TypesenseUpsertDocument(doc)
}

func (s *CourseService) deleteCourseFromTypesense(courseID entitycommon.Id) error {
	err := s.Repo.Course.TypesenseDeleteDocument(int64(courseID))
	if err != nil && strings.Contains(err.Error(), "404") {
		return nil
	}
	return global.Err(err)
}

// CreateCourse creates a new course and assigns ownership permissions to the user
func (s *CourseService) CreateCourse(input CreateCourseInput) (*CreateCourseOutput, error) {
	if err := s.Repo.Course.Create(input.Course); err != nil {
		return nil, global.Err(err)
	}

	permissions := &entity.CoursePermissions{
		UserID:   input.UserId,
		CourseID: input.Course.ID,
		Role:     entity.CoursePermissionsRoleOwner,
	}
	if err := s.Repo.CoursePermissions.Create(permissions); err != nil {
		return nil, global.Err(err)
	}

	if err := s.SyncCourseInTypesense(
		SyncCourseInTypesenseInput{
			CourseID: input.Course.ID,
			Course:   input.Course,
			Stats:    &analytics.CourseStats{},
		},
	); err != nil {
		return nil, global.Err(err)
	}

	return &CreateCourseOutput{
		Course:      input.Course,
		Permissions: permissions,
	}, nil
}

// GetCoursesWithPermissions retrieves courses with their permissions for a user
func (s *CourseService) GetCoursesWithPermissions(input GetCoursesWithPermissionsInput) ([]GetCoursesWithPermissionsOutput, error) {

	perm, err := s.Repo.CoursePermissions.FindCoursesWithPrefix(input.UserId, input.Preload, input.Pagination, input.QueryByTitle)
	if err != nil {
		return nil, global.Err(err)
	}

	resp := make([]GetCoursesWithPermissionsOutput, len(perm))
	for i, withPermissions := range perm {
		stats := &analytics.CourseStats{
			CourseID: int64(withPermissions.CourseID),
		}
		if err := s.Repo.Analytics.FindOneCourseStats(stats); err != nil && !errors.Is(gorm.ErrRecordNotFound, err) {
			return nil, global.Err(err)
		}

		resp[i] = GetCoursesWithPermissionsOutput{
			WithPermissions: &withPermissions,
			Stats:           stats,
		}
	}

	return resp, nil
}

// GetCourseDetails retrieves a course with all its sections and lectures
func (s *CourseService) GetCourseDetails(input GetCourseDetailsInput) (*entity.Course, error) {
	course := &entity.Course{Model: entitycommon.Model{ID: input.CourseId}}
	preload := entity.CoursePreloadOptions{
		Sections: true,
		CourseSectionPreloadOptions: entity.CourseSectionPreloadOptions{
			Lectures: true,
		},
	}
	if err := s.Repo.Course.FindOne(course, preload); err != nil {
		return nil, global.Err(err)
	}

	return course, nil
}

// UpdateCourse updates an existing course
func (s *CourseService) UpdateCourse(input UpdateCourseInput) (*entity.Course, error) {
	course := &entity.Course{}
	var selectColumns []string

	if input.Title != nil {
		course.Title = *input.Title
	}
	if input.Description != nil {
		course.Description = *input.Description
	}
	if input.Visibility != nil {
		course.Visibility = *input.Visibility
	}
	if input.LectureAccesibility != nil {
		course.LectureAccesibility = *input.LectureAccesibility
	}
	if input.Language != nil {
		course.Language = *input.Language
	}
	if input.Price != nil {
		course.Price = *input.Price
		selectColumns = append(selectColumns, "price")
	}
	if input.DiscountPercent != nil {
		course.DiscountPercent = *input.DiscountPercent
		selectColumns = append(selectColumns, "discount_percent")
	}

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
			return nil, global.Err(err)
		}

		metadata := &entity.FileMetadataKindImage{}
		if err := json.Unmarshal(file.Metadata, metadata); err != nil {
			return nil, global.Err(err)
		}
		res := metadata.ChooseClosestImageResolution(entity.FileMetadataKindImageResolutionVariantLarge)

		path := fmt.Sprint(file.ID) + "/" + res.Path
		course.Poster = (*entitycommon.Path)(&path)
	}

	updateBy := &entity.Course{Model: entitycommon.Model{ID: input.CourseId}}
	updated, err := s.Repo.Course.Update(updateBy, course, selectColumns...)
	if err != nil {
		return nil, global.Err(err)
	}

	return updated, nil
}

// DeleteCourse deletes a course and all its related data
func (s *CourseService) DeleteCourse(input DeleteCourseInput) error {
	course := &entity.Course{Model: entitycommon.Model{ID: input.CourseId}}
	preload := entity.CoursePreloadOptions{
		Sections: true,
		CourseSectionPreloadOptions: entity.CourseSectionPreloadOptions{
			Lectures: true,
			// LecturePreloadOptions: entity.LecturePreloadOptions{
			// 	Assets: true,
			// },
		},
		Permissions: true,
		FavCorses:   true,
		Reviews:     true,
		Quizzes:     true,
		Files:       true,
	}
	if err := s.Repo.Course.FindOne(course, preload); err != nil {
		return global.Err(err)
	}

	if err := s.Repo.Course.Delete(course); err != nil {
		return global.Err(err)
	}

	if err := s.deleteCourseFromTypesense(input.CourseId); err != nil {
		return global.Err(err)
	}

	notificationMetadata, _ := json.Marshal(&entity.NotificationTypeCourseVisibilityUpdatedMetadata{
		CourseId:         course.ID,
		CourseVisibility: nil,
	})
	notification := &entity.Notification{
		ActorID:          &input.UserId,
		NotificationType: entity.NotificationTypeCourseVisibilityUpdated,
		Metadata:         notificationMetadata,
	}
	s.Repo.Notification.CreateMultipleUsers(notification)

	return nil
}

// FindPublicCourses retrieves public courses with optional filtering and pagination
func (s *CourseService) FindPublicCourses(input FindPublicCoursesInput) ([]entity.Course, error) {
	return s.Repo.Course.FindCoursesWithPrefix(
		&entity.Course{Visibility: entity.CourseVisibilityPublic},
		entity.CoursePreloadOptions{},
		input.Pagination,
		input.QueryByTitle,
	)
}

// WatchCourse retrieves a course with its sections, lectures, and files for viewing
func (s *CourseService) WatchCourse(input WatchCourseInput) (*WatchCourseOutput, error) {
	course := &entity.Course{Slug: input.CourseSlug}
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
		return nil, global.Err(err)
	}

	isFavorite := false

	if input.UserId != nil {
		favCourse := &entity.FavoriteCourse{
			UserID:   *input.UserId,
			CourseID: course.ID,
		}
		if err := s.Repo.FavoriteCourse.FindOne(
			favCourse,
			entity.FavoriteCoursePreloadOptions{},
		); err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, global.Err(err)
			}
		} else {
			isFavorite = true
		}
	}

	owner := &entity.CoursePermissions{
		Role:     entity.CoursePermissionsRoleOwner,
		CourseID: course.ID,
	}
	if err := s.Repo.CoursePermissions.FindOne(
		owner,
		entity.CoursePermissionsPreloadOptions{User: true},
	); err != nil {
		return nil, global.Err(err)
	}

	return &WatchCourseOutput{
		Course:     course,
		Owner:      owner.User,
		IsFavorite: isFavorite,
	}, nil
}

func (s *CourseService) GetCourseWithSectionsAndLectures(input GetCourseWithSectionsAndLecturesInput) (*entity.Course, error) {
	course := &entity.Course{Model: entitycommon.Model{ID: input.CourseId}}
	preload := entity.CoursePreloadOptions{
		Sections: true,
		CourseSectionPreloadOptions: entity.CourseSectionPreloadOptions{
			Lectures: true,
		},
	}
	if err := s.Repo.Course.FindOne(course, preload); err != nil {
		return nil, global.Err(err)
	}
	return course, nil
}
