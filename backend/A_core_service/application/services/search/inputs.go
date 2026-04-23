package search

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/typesenseentity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type SearchCoursesInput struct {
	Pagination          *utils.Pagination
	SearchMode          entitycommon.SearchMode
	QueryByTitle        string
	LectureAccesibility entity.CourseLectureAccesibilityList
	Language            entity.CourseLanguageList
	Tags                []string
	Author              []string
	MinDiscountedPrice  *int32
	MaxDiscountedPrice  *int32
	MinAvgRating        *float64
	SortBy              *entity.CourseSortBy
	SortOrder           *utils.SortOrder
	UserAnalytics       SearchCoursesUserAnalytics
}

type SearchCoursesUserAnalytics struct {
	UserId     *entitycommon.Id
	UserSex    *entity.UserSex
	BirthDate  *time.Time
	DeviceType entitycommon.DeviceType
}

type GetTopCourseTitlesInput struct {
	Query      string
	Pagination *utils.Pagination
}

type GetCourseRecommendationsInput struct {
	CourseID   entitycommon.Id
	Pagination *utils.Pagination
}

type GetFilterSuggestionsInput struct {
	Field typesenseentity.FacetableFields
	Query string
	Size  int
}

type GetTopCoursesInput struct {
	UserAnalytics SearchCoursesUserAnalytics
	Size          int
}
