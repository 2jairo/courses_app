package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm/clause"
)

type LectureAssetRepository struct {
	Db *db.DatabasesConnection
}

func (self *LectureAssetRepository) Find(
	findBy *entity.LectureAsset,
	preload entity.LectureAssetPreloadOptions,
) ([]entity.LectureAsset, error) {
	rows := []entity.LectureAsset{}

	query := self.Db.Pg.Model(&entity.LectureAsset{}).
		Where(findBy)

	preload.Preload(query, "")

	err := query.Find(&rows).Error
	return rows, global.Err(err)
}

func (self *LectureAssetRepository) FindIn(fileIds []int64, preload entity.LectureAssetPreloadOptions) ([]entity.LectureAsset, error) {
	rows := []entity.LectureAsset{}

	query := self.Db.Pg.Model(&entity.LectureAsset{}).
		Where("file_id IN ?", fileIds)

	preload.Preload(query, "")

	err := query.Find(&rows).Error
	return rows, global.Err(err)
}

func (self *LectureAssetRepository) FindOne(findBy *entity.LectureAsset, preload entity.LectureAssetPreloadOptions) error {
	query := self.Db.Pg.Model(&entity.LectureAsset{}).
		Where(findBy)

	preload.Preload(query, "")

	return query.First(findBy).Error
}

func (self *LectureAssetRepository) Create(lectureAsset *entity.LectureAsset, preload entity.LectureAssetPreloadOptions) error {
	query := self.Db.Pg.Model(&entity.LectureAsset{})
	preload.Preload(query, "")

	return query.Create(lectureAsset).First(lectureAsset).Error
}

func (self *LectureAssetRepository) CreateMany(lectureAssets []entity.LectureAsset) error {
	if len(lectureAssets) == 0 {
		return nil
	}

	return self.Db.Pg.Create(&lectureAssets).Error
}

func (self *LectureAssetRepository) Delete(deleteBy []entity.LectureAsset) error {
	return self.Db.Pg.
		Model(&entity.LectureAsset{}).
		Where(deleteBy).
		Delete(deleteBy).
		Error
}

func (self *LectureAssetRepository) UpdateOne(findBy *entity.LectureAsset, update *entity.LectureAsset) error {
	result := self.Db.Pg.
		Model(&update).
		Where(findBy).
		Clauses(clause.Returning{}).
		Updates(&update)

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}

	return nil
}
