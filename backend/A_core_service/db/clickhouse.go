package db

import (
	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"gorm.io/driver/clickhouse"
	"gorm.io/gorm"
)

func chNew() (*gorm.DB, error) {
	return gorm.Open(clickhouse.Open(config.ClickhouseUrl), &gorm.Config{})
}
