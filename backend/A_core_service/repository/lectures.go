package repository

import "github.com/2jairo/courses_app/backend/A_core_service/db"

type LectureRepository struct {
	Db *db.DatabasesConnection
}
