package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
)

type CourseReviewRepository struct {
	Db *db.DatabasesConnection
}

func (r *CourseReviewRepository) Create(review *entity.CourseReview, preload entity.CourseReviewPreloadOptions) error {
	query := r.Db.Pg.Model(&entity.CourseReview{})
	preload.Preload(query, "")
	return query.Create(review).First(review).Error
}

func (r *CourseReviewRepository) FindOne(findBy *entity.CourseReview, preload entity.CourseReviewPreloadOptions) error {
	query := r.Db.Pg.Model(&entity.CourseReview{}).Where(findBy)
	preload.Preload(query, "")
	return query.First(findBy).Error
}

func (r *CourseReviewRepository) Find(
	findBy *entity.CourseReview,
	preload entity.CourseReviewPreloadOptions,
	pagination *utils.Pagination,
) ([]entity.CourseReview, error) {
	rows := []entity.CourseReview{}
	query := r.Db.Pg.Model(&entity.CourseReview{}).Where(findBy).Where("LENGTH(comment) > 0")
	preload.Preload(query, "")
	if pagination != nil {
		query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}
	query.Order("id DESC")
	err := query.Find(&rows).Error
	return rows, global.Err(err)
}

func (r *CourseReviewRepository) Delete(deleteBy *entity.CourseReview) error {
	return r.Db.Pg.
		Where(deleteBy).
		Delete(&entity.CourseReview{}).
		Error
}

func (r *CourseReviewRepository) Update(updateBy *entity.CourseReview, updates *entity.CourseReview, preload entity.CourseReviewPreloadOptions) (*entity.CourseReview, error) {
	updated := *updates
	result := r.Db.Pg.
		Model(&updated).
		Where(updateBy).
		Updates(&updated)
	if result.Error != nil {
		return nil, result.Error
	}
	if err := r.FindOne(&updated, preload); err != nil {
		return nil, global.Err(err)
	}
	return &updated, nil
}
