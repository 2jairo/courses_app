package analytics

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
)

type CourseSearchQueriesRaw struct {
	CreatedAt time.Time
	Query     string
	CourseID  entitycommon.Id
	Mode      entitycommon.SearchMode
	Seen      bool
	UserID    *entitycommon.Id
}

func (CourseSearchQueriesRaw) TableName() string {
	return "course_search_queries_raw"
}
