package search

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	typesenseentity "github.com/2jairo/courses_app/backend/A_core_service/entity/typesenseentity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type SearchCoursesOutput struct {
	Found   int32
	Courses []typesenseentity.CourseDocument
	Filters SearchCourseFiltersOutput
}

type SearchCourseFiltersOutput struct {
	Pagination           utils.Pagination
	QueryByTitle         string
	OriginalQueryByTitle string
	LectureAccesibility  entity.CourseLectureAccesibilityList
	Language             entity.CourseLanguageList
	Tags                 []string
	Author               []string
	MinDiscountedPrice   *int32
	MaxDiscountedPrice   *int32
	MinAvgRating         *float64
	SortBy               *entity.CourseSortBy
	SortOrder            *utils.SortOrder
	SearchMode           entitycommon.SearchMode
}

type FilterSuggestionOutput struct {
	Name  string
	Count int
}
