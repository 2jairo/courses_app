package search

import (
	searchservice "github.com/2jairo/courses_app/backend/A_core_service/application/services/search"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	typesenseentity "github.com/2jairo/courses_app/backend/A_core_service/entity/typesenseentity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type SearchCourseResponse struct {
	ID                  string   `json:"id"`
	Slug                string   `json:"slug"`
	UpdatedAt           int64    `json:"updatedAt"`
	LectureAccesibility string   `json:"lectureAccesibility"`
	Title               string   `json:"title"`
	Description         string   `json:"description"`
	Poster              string   `json:"poster"`
	Language            string   `json:"language"`
	LecturesAmmount     int32    `json:"lecturesAmmount"`
	Price               int32    `json:"price"`
	DiscountPercent     int32    `json:"discountPercent"`
	Tags                []string `json:"tags"`
	Author              string   `json:"author"`
	AvgRating           float64  `json:"avgRating"`
	TotalReviews        int64    `json:"totalReviews"`
	TotalPurchases      int64    `json:"totalPurchases"`
}

type FilterSuggestionResponse struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type SearchCoursesFiltersResponse struct {
	utils.Pagination
	SearchMode           entitycommon.SearchMode              `json:"mode"`
	OriginalQueryByTitle string                               `json:"originalQ,omitempty"`
	QueryByTitle         string                               `json:"q,omitempty"`
	LectureAccesibility  entity.CourseLectureAccesibilityList `json:"lectureAccesibility,omitempty"`
	Language             entity.CourseLanguageList            `json:"language,omitempty"`
	Tags                 []string                             `json:"tags,omitempty"`
	Author               []string                             `json:"author,omitempty"`
	MinDiscountedPrice   *int32                               `json:"minDiscountedPrice,omitempty"`
	MaxDiscountedPrice   *int32                               `json:"maxDiscountedPrice,omitempty"`
	MinAvgRating         *float64                             `json:"minAvgRating,omitempty"`
	SortOrder            *utils.SortOrder                     `json:"sortOrder,omitempty"`
	SortBy               *entity.CourseSortBy                 `json:"sortBy,omitempty"`
}

type SearchCoursesResponse struct {
	Found   int32                        `json:"found"`
	Courses []SearchCourseResponse       `json:"courses"`
	Filters SearchCoursesFiltersResponse `json:"filters"`
}

type SearchCoursesAutocompleteResponse struct {
	Popular []SearchCoursesAutocompleteItemResponse `json:"popular"`
	Titles  []SearchCoursesAutocompleteItemResponse `json:"titles"`
}
type SearchCoursesAutocompleteItemResponse struct {
	Query string                  `json:"query"`
	Mode  entitycommon.SearchMode `json:"mode"`
}

func getSearchCourseResponse(c typesenseentity.CourseDocument) SearchCourseResponse {
	return SearchCourseResponse{
		ID:                  c.ID,
		Slug:                c.Slug,
		UpdatedAt:           c.UpdatedAt,
		LectureAccesibility: c.LectureAccesibility,
		Title:               c.Title,
		Description:         c.Description,
		Poster:              c.Poster,
		Language:            c.Language,
		LecturesAmmount:     c.LecturesAmmount,
		Price:               c.Price,
		DiscountPercent:     c.DiscountPercent,
		Tags:                c.Tags,
		Author:              c.Author,
		AvgRating:           c.AvgRating,
		TotalReviews:        c.TotalReviews,
		TotalPurchases:      c.TotalPurchases,
	}
}

func (self *SearchCoursesRequest) getResponse(output *searchservice.SearchCoursesOutput) *SearchCoursesResponse {
	courses := make([]SearchCourseResponse, len(output.Courses))

	for i, course := range output.Courses {
		courses[i] = getSearchCourseResponse(course)
	}

	q := ""
	if output.Filters.QueryByTitle != "*" {
		q = output.Filters.QueryByTitle
	}

	originalQ := ""
	if output.Filters.OriginalQueryByTitle != "*" {
		originalQ = output.Filters.OriginalQueryByTitle
	}

	return &SearchCoursesResponse{
		Found:   output.Found,
		Courses: courses,
		Filters: SearchCoursesFiltersResponse{
			Pagination:           output.Filters.Pagination,
			QueryByTitle:         q,
			SearchMode:           output.Filters.SearchMode,
			OriginalQueryByTitle: originalQ,
			LectureAccesibility:  output.Filters.LectureAccesibility,
			Language:             output.Filters.Language,
			Tags:                 output.Filters.Tags,
			Author:               output.Filters.Author,
			MinDiscountedPrice:   output.Filters.MinDiscountedPrice,
			MaxDiscountedPrice:   output.Filters.MaxDiscountedPrice,
			MinAvgRating:         output.Filters.MinAvgRating,
			SortOrder:            output.Filters.SortOrder,
			SortBy:               output.Filters.SortBy,
		},
	}
}

func (self *SearchCoursesAutocomplete) getResponse(popular []analytics.CourseSearchQueriesRecent, titles []string) *SearchCoursesAutocompleteResponse {
	popularInner := make([]SearchCoursesAutocompleteItemResponse, len(popular))
	for i, p := range popular {
		popularInner[i] = SearchCoursesAutocompleteItemResponse{
			Query: p.Query,
			Mode:  p.Mode,
		}
	}

	titlesInner := make([]SearchCoursesAutocompleteItemResponse, len(titles))
	for i, t := range titles {
		titlesInner[i] = SearchCoursesAutocompleteItemResponse{
			Query: t,
			Mode:  entitycommon.SearchModeFTS,
		}
	}

	return &SearchCoursesAutocompleteResponse{
		Popular: popularInner,
		Titles:  titlesInner,
	}
}

func (self *GetCourseRecommendationsRequest) getResponse(courses []typesenseentity.CourseDocument) []SearchCourseResponse {
	resp := make([]SearchCourseResponse, len(courses))
	for i, course := range courses {
		resp[i] = getSearchCourseResponse(course)
	}
	return resp
}

func (self *GetFilterSuggestionsRequest) getResponse(output []searchservice.FilterSuggestionOutput) []FilterSuggestionResponse {
	resp := make([]FilterSuggestionResponse, len(output))
	for i, suggestion := range output {
		resp[i] = FilterSuggestionResponse{
			Name:  suggestion.Name,
			Count: suggestion.Count,
		}
	}
	return resp
}

func (self *GetTopCoursesRequest) getResponse(courses []typesenseentity.CourseDocument) []SearchCourseResponse {
	resp := make([]SearchCourseResponse, len(courses))
	for i, course := range courses {
		resp[i] = getSearchCourseResponse(course)
	}
	return resp
}
