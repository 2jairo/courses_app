package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type CourseGiftCodeRepository struct {
	Db *db.DatabasesConnection
}

func (r *CourseGiftCodeRepository) Create(courseGiftCode *entity.CourseGiftCode) error {
	return r.Db.Pg.Create(courseGiftCode).Error
}

func (r *CourseGiftCodeRepository) CreateBatch(courseGiftCodes []entity.CourseGiftCode) error {
	return r.Db.Pg.Create(&courseGiftCodes).Error
}

func (self *CourseGiftCodeRepository) Update(updateBy *entity.CourseGiftCode, courseGiftCode *entity.CourseGiftCode) error {
	return self.Db.Pg.
		Model(courseGiftCode).
		Where(updateBy).
		Updates(courseGiftCode).
		Error
}

func (r *CourseGiftCodeRepository) FindOne(findBy *entity.CourseGiftCode, preload entity.CourseGiftCodePreloadOptions) error {
	query := r.Db.Pg.Model(&entity.CourseGiftCode{}).Where(findBy)
	preload.Preload(query, "")
	return query.First(findBy).Error
}

func (r *CourseGiftCodeRepository) Find(
	findBy *entity.CourseGiftCode,
	preload entity.CourseGiftCodePreloadOptions,
	pagination *utils.Pagination,
) ([]entity.CourseGiftCode, error) {
	var rows []entity.CourseGiftCode
	query := r.Db.Pg.Model(&entity.CourseGiftCode{}).Where(findBy)
	if pagination != nil {
		query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}

	preload.Preload(query, "")
	err := query.Find(&rows).Error
	return rows, err
}

func (r *CourseGiftCodeRepository) Count(findBy *entity.CourseGiftCode) (int64, error) {
	var count int64
	err := r.Db.Pg.Model(&entity.CourseGiftCode{}).Where(findBy).Count(&count).Error
	return count, err
}

func (r *CourseGiftCodeRepository) FindById(id int64, preload entity.CourseGiftCodePreloadOptions) (*entity.CourseGiftCode, error) {
	finding := &entity.CourseGiftCode{Model: entitycommon.Model{ID: entitycommon.Id(id)}}
	err := r.FindOne(finding, preload)
	return finding, err
}

func (r *CourseGiftCodeRepository) Delete(deleteBy *entity.CourseGiftCode) error {
	return r.Db.Pg.
		Where(deleteBy).
		Delete(&entity.CourseGiftCode{}).
		Error
}
