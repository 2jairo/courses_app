package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
)

type LectureCommentRepository struct {
	Db *db.DatabasesConnection
}

func (r *LectureCommentRepository) Create(comment *entity.LectureComment, preload entity.LectureCommentPreloadOptions) error {
	query := r.Db.Pg.Model(&entity.LectureComment{})
	preload.Preload(query, "")
	return query.Create(comment).First(comment).Error
}

func (r *LectureCommentRepository) FindOne(findBy *entity.LectureComment, preload entity.LectureCommentPreloadOptions) error {
	query := r.Db.Pg.Model(&entity.LectureComment{}).Where(findBy)
	preload.Preload(query, "")
	return query.First(findBy).Error
}

func (r *LectureCommentRepository) Find(
	findBy *entity.LectureComment,
	preload entity.LectureCommentPreloadOptions,
	pagination *utils.Pagination,
	filterReplies bool,
) ([]entity.LectureComment, error) {
	rows := []entity.LectureComment{}
	query := r.Db.Pg.Model(&entity.LectureComment{}).Where(findBy)

	preload.Preload(query, "")

	if filterReplies {
		query = query.Where("parent_comment_id IS NULL")
	}

	if pagination != nil {
		query = query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}

	err := query.Order("id DESC").Find(&rows).Error
	return rows, global.Err(err)
}

func (r *LectureCommentRepository) Delete(deleteBy *entity.LectureComment) error {
	return r.Db.Pg.
		Where(deleteBy).
		Delete(&entity.LectureComment{}).
		Error
}

func (r *LectureCommentRepository) Update(updateBy *entity.LectureComment, updates *entity.LectureComment, preload entity.LectureCommentPreloadOptions) (*entity.LectureComment, error) {
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
