package entitycommon

import (
	"time"

	"gorm.io/gorm"
)

type Model struct {
	ID        Id             `gorm:"type:bigint;primaryKey"`
	CreatedAt time.Time      `gorm:"type:timestamptz;not null;default:now()"`
	DeletedAt gorm.DeletedAt `gorm:"type:timestamptz"`
}
