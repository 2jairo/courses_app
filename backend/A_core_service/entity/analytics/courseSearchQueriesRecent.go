package analytics

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
)

type CourseSearchQueriesRecent struct {
	CourseID     entitycommon.Id
	Query        string
	Seen         bool
	Mode         entitycommon.SearchMode
	Count        uint64
	LastSearched time.Time
}

func (CourseSearchQueriesRecent) TableName() string {
	return "course_search_queries_recent_aggregated"
}
