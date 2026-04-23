package coursereview

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type CourseReviewService struct {
	Repo *infrastructure.AppRepositories
}

func (s *CourseReviewService) FindNotEmptyReviews(input FindReviewsInput) ([]entity.CourseReview, error) {
	course := &entity.Course{Slug: entitycommon.Slug{Slug: input.CourseSlug}}
	if err := s.Repo.Course.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
		return nil, global.Err(err)
	}

	findBy := &entity.CourseReview{CourseID: course.ID}
	if input.Rating > 0 {
		findBy.Rating = input.Rating
	}

	return s.Repo.CourseReview.Find(
		findBy,
		entity.CourseReviewPreloadOptions{User: true},
		input.Pagination,
	)
}

func (s *CourseReviewService) CreateReview(input CreateReviewInput) (*entity.CourseReview, error) {
	course := &entity.Course{Slug: entitycommon.Slug{Slug: input.CourseSlug}}
	if err := s.Repo.Course.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
		return nil, global.Err(err)
	}

	review := &entity.CourseReview{
		UserID:   input.UserID,
		CourseID: course.ID,
		Rating:   input.Rating,
		Comment:  input.Comment,
	}

	if err := s.Repo.CourseReview.Create(
		review,
		entity.CourseReviewPreloadOptions{User: true},
	); err != nil {
		return nil, global.Err(err)
	}

	reviewAnalytics := &analytics.CourseReviewsRaw{
		UserID:   input.UserID,
		CourseID: course.ID,
		Rating:   int8(input.Rating),
		ReviewId: review.ID,
		IsUpdate: false,
	}
	if err := s.Repo.Analytics.Create(&analytics.CourseReviewsRaw{}, reviewAnalytics); err != nil {
		return nil, global.Err(err)
	}

	return review, nil
}

func (s *CourseReviewService) UpdateReview(input UpdateReviewInput) (*entity.CourseReview, error) {
	existing := &entity.CourseReview{Model: entitycommon.Model{ID: input.ReviewID}}
	if err := s.Repo.CourseReview.FindOne(existing, entity.CourseReviewPreloadOptions{}); err != nil {
		return nil, global.Err(err)
	}

	if existing.UserID != input.UserID {
		return nil, &localerror.LocalError{Err: localerror.ErrKindForbidden, Status: fiber.StatusForbidden}
	}

	updates := &entity.CourseReview{}
	if input.Rating != nil {
		updates.Rating = *input.Rating
	}
	if input.Comment != nil {
		updates.Comment = *input.Comment
	}

	courseReview, err := s.Repo.CourseReview.Update(
		&entity.CourseReview{Model: entitycommon.Model{ID: input.ReviewID}},
		updates,
		entity.CourseReviewPreloadOptions{User: true},
	)
	if err != nil {
		return nil, global.Err(err)
	}

	if input.Rating != nil {
		reviewAnalytics := &analytics.CourseReviewsRaw{
			UserID:   input.UserID,
			CourseID: courseReview.CourseID,
			Rating:   int8(*input.Rating),
			ReviewId: courseReview.ID,
			IsUpdate: true,
		}
		if err := s.Repo.Analytics.Create(&analytics.CourseReviewsRaw{}, reviewAnalytics); err != nil {
			return nil, global.Err(err)
		}
	}

	return courseReview, nil
}
