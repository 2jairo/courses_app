package db

import (
	"fmt"

	"gorm.io/gorm"
)

type DatabasesConnection struct {
	Pg *gorm.DB
}

func NewDatabasesConnection() *DatabasesConnection {
	pg, err := pgNew()
	if err != nil {
		panic(fmt.Sprintf("Failed to initialize app state: %s", err))
	}

	return &DatabasesConnection{
		Pg: pg,
	}
}
