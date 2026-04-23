package analytics

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
)

type CourseSearchQueries struct {
	CourseID     entitycommon.Id
	Query        string
	SearchCount  uint64
	Seen         bool
	Mode         entitycommon.SearchMode
	LastSearched time.Time
}

func (CourseSearchQueries) TableName() string {
	return "course_search_queries"
}

type CourseSearchQueriesAggregated struct {
	Query        string
	SearchCount  uint64
	Seen         bool
	Mode         entitycommon.SearchMode
	LastSearched time.Time
}

func (CourseSearchQueriesAggregated) TableName() string {
	return "course_search_queries_aggregated"
}
