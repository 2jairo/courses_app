package repository

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
)

type AnalyticsRepository struct {
	Db *db.DatabasesConnection
}

func (self *AnalyticsRepository) CreateView(view *analytics.CourseViewsRaw) error {
	return self.Db.Ch.
		Model(&analytics.CourseViewsRaw{}).
		Create(view).
		Error
}
