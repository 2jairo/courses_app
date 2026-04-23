package db

import (
	"net/url"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func pgNew() (*gorm.DB, error) {
	u, err := url.Parse(config.PostgresUrl)
	if err != nil {
		return nil, global.Err(err)
	}

	password, _ := u.User.Password()

	dsn := "host=" + u.Hostname() +
		" user=" + u.User.Username() +
		" password=" + password +
		" dbname=" + u.Path[1:] +
		" port=" + u.Port() +
		" sslmode=disable"

	return gorm.Open(postgres.Open(dsn), &gorm.Config{})
}
