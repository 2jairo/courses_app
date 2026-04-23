package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
)

type NotificationRepository struct {
	Db *db.DatabasesConnection
}

func (self *NotificationRepository) FindOne(findBy *entity.Notification, preload entity.NotificationPreloadOptions) error {
	query := self.Db.Pg.Model(&entity.Notification{}).
		Where(findBy)

	preload.Preload(query, "")

	return query.First(findBy).Error
}

func (self *NotificationRepository) Find(
	findBy *entity.Notification,
	preload entity.NotificationPreloadOptions,
	pagination *utils.Pagination,
) ([]entity.Notification, error) {
	rows := []entity.Notification{}

	query := self.Db.Pg.Model(&entity.Notification{}).
		Where(findBy)

	preload.Preload(query, "")

	// Default order by created_at descending
	query = query.Order("created_at DESC")

	if pagination != nil {
		query = query.Offset(pagination.GetOffset()).Limit(pagination.GetLimit())
	}

	err := query.Find(&rows).Error
	return rows, global.Err(err)
}

func (self *NotificationRepository) Create(notification *entity.Notification) error {
	query := self.Db.Pg.Model(&entity.Notification{})
	return query.Create(notification).Error
}

func (self *NotificationRepository) CreateMultipleUsers(notification *entity.Notification) error {
	query := self.Db.Pg.Model(&entity.Notification{})
	return query.Create(notification).Error
}

func (self *NotificationRepository) Update(updateBy *entity.Notification, notification *entity.Notification) (*entity.Notification, error) {
	updated := *notification
	result := self.Db.Pg.
		Model(&updated).
		Where(updateBy).
		Updates(&updated)

	if result.Error != nil {
		return nil, result.Error
	}

	return &updated, nil
}

func (self *NotificationRepository) UpdateMultiple(updateBy *entity.Notification, notification *entity.Notification) (int64, error) {
	result := self.Db.Pg.
		Model(&entity.Notification{}).
		Where(updateBy).
		Updates(notification)

	if result.Error != nil {
		return 0, result.Error
	}

	return result.RowsAffected, nil
}

func (self *NotificationRepository) Delete(deleteBy *entity.Notification) error {
	return self.Db.Pg.
		Model(&entity.Notification{}).
		Where(deleteBy).
		Delete(deleteBy).
		Error
}
