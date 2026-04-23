package search

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	typesenseentity "github.com/2jairo/courses_app/backend/A_core_service/entity/typesenseentity"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/typesense/typesense-go/v4/typesense/api"
	"github.com/typesense/typesense-go/v4/typesense/api/pointer"
)

type SearchService struct {
	Repo *infrastructure.AppRepositories
}

func (s *SearchService) SearchCourses(input SearchCoursesInput) (*SearchCoursesOutput, error) {
	originalQueryByTitle := input.QueryByTitle

	if input.SearchMode == entitycommon.SearchModeAI {
		generated, _ := s.Repo.Search.GenerateFiltersFromNlPrompt(input.QueryByTitle)

		if generated != nil {
			input.LectureAccesibility = nil
			input.Language = nil
			input.Tags = nil
			input.Author = nil
			input.MinDiscountedPrice = nil
			input.MaxDiscountedPrice = nil
			input.MinAvgRating = nil
			input.SortBy = nil
			input.SortOrder = nil
			input.Pagination = nil
			input.QueryByTitle = generated.Q

			if len(generated.LectureAccesibility) > 0 {
				input.LectureAccesibility = make(entity.CourseLectureAccesibilityList, len(generated.LectureAccesibility))
				for i, v := range generated.LectureAccesibility {
					input.LectureAccesibility[i] = entity.CourseLectureAccesibility(v)
				}
			} else {
				input.LectureAccesibility = nil
			}

			if len(generated.Language) > 0 {
				input.Language = make(entity.CourseLanguageList, len(generated.Language))
				for i, v := range generated.Language {
					input.Language[i] = entity.CourseLanguage(v)
				}
			} else {
				input.Language = nil
			}

			input.Tags = generated.Tags
			input.Author = generated.Author

			if generated.MinDiscountedPrice != 0 {
				input.MinDiscountedPrice = utils.Ref(generated.MinDiscountedPrice)
			}
			if generated.MaxDiscountedPrice != 0 {
				input.MaxDiscountedPrice = utils.Ref(generated.MaxDiscountedPrice)
			}
			if generated.MinAvgRating != 0 {
				input.MinAvgRating = utils.Ref(generated.MinAvgRating)
			}
			if generated.SortBy != "" {
				sortBy := entity.CourseSortBy(generated.SortBy)
				input.SortBy = &sortBy
			}
			if generated.SortOrder != "" {
				input.SortOrder = &generated.SortOrder
			}
		}
	}

	queryByTitle := strings.TrimSpace(input.QueryByTitle)
	if queryByTitle == "" {
		queryByTitle = "*"
	}

	params := &api.SearchCollectionParams{
		Q:             pointer.String(queryByTitle),
		QueryBy:       pointer.String("title,description,course_embedding"),
		ExcludeFields: pointer.String("course_embedding"),
		VectorQuery:   pointer.String("course_embedding:([], distance_threshold: 0.2, alpha: 0.7)"),
	}

	if input.Pagination != nil {
		params.Page = pointer.Int(input.Pagination.Page)
		params.PerPage = pointer.Int(input.Pagination.Size)
	}

	if filterBy := buildCourseFilterBy(input); filterBy != "" {
		params.FilterBy = pointer.String(filterBy)
	}

	if sortBy := buildCourseSortBy(input.SortBy, input.SortOrder); sortBy != "" {
		params.SortBy = pointer.String(sortBy)
	}

	result, found, err := s.Repo.Search.SearchCourses(params)
	if err != nil {
		return nil, global.Err(err)
	}

	views := make([]analytics.CourseViewsRaw, 0, len(result))
	queries := make([]analytics.CourseSearchQueriesRaw, 0, len(result))

	for _, doc := range result {
		docIDNum, err := strconv.ParseInt(doc.ID, 10, 64)
		if err != nil {
			continue
		}

		if len(originalQueryByTitle) > 0 && originalQueryByTitle != "*" {
			queries = append(queries, analytics.CourseSearchQueriesRaw{
				Query:    originalQueryByTitle,
				CourseID: entitycommon.Id(docIDNum),
				Mode:     input.SearchMode,
				Seen:     false,
				UserID:   input.UserAnalytics.UserId,
			})
		}
		views = append(views, analytics.CourseViewsRaw{
			CourseID:   entitycommon.Id(docIDNum),
			Device:     input.UserAnalytics.DeviceType,
			ViewSource: analytics.CourseViewsSourceSearch,
			UserSex:    input.UserAnalytics.UserSex,
			UserID:     input.UserAnalytics.UserId,
			BirthDate:  input.UserAnalytics.BirthDate,
			Seen:       false,
		})
	}

	if len(views) > 0 {
		s.Repo.Analytics.Create(&analytics.CourseViewsRaw{}, views)
	}
	if len(queries) > 0 {
		s.Repo.Analytics.Create(&analytics.CourseSearchQueriesRaw{}, queries)
	}

	filtersOutput := SearchCourseFiltersOutput{
		QueryByTitle:         input.QueryByTitle,
		OriginalQueryByTitle: originalQueryByTitle,
		LectureAccesibility:  input.LectureAccesibility,
		Language:             input.Language,
		Tags:                 input.Tags,
		Author:               input.Author,
		MinDiscountedPrice:   input.MinDiscountedPrice,
		MaxDiscountedPrice:   input.MaxDiscountedPrice,
		MinAvgRating:         input.MinAvgRating,
		SortBy:               input.SortBy,
		SortOrder:            input.SortOrder,
		SearchMode:           input.SearchMode,
	}
	if input.Pagination != nil {
		filtersOutput.Pagination = *input.Pagination
	}

	return &SearchCoursesOutput{
		Courses: result,
		Found:   int32(found),
		Filters: filtersOutput,
	}, nil
}

func (s *SearchService) GetTopCourseTitles(input GetTopCourseTitlesInput) ([]string, error) {
	query := strings.TrimSpace(input.Query)
	if query == "" {
		query = "*"
	}

	params := &api.SearchCollectionParams{
		Q:             pointer.String(query),
		QueryBy:       pointer.String("title,description,tags"),
		ExcludeFields: pointer.String("course_embedding"),
		SortBy: pointer.String(
			buildCourseSortBy(utils.Ref(entity.CourseSortByTrending), utils.Ref(utils.SortOrderDesc)),
		),
	}
	if input.Pagination != nil {
		params.PerPage = &input.Pagination.Size
		params.Page = &input.Pagination.Page
	}

	result, _, err := s.Repo.Search.SearchCourses(params)
	if err != nil {
		return nil, global.Err(err)
	}

	titles := make([]string, 0, len(result))
	for _, hit := range result {
		titles = append(titles, hit.Title)
	}

	return titles, nil
}

func (s *SearchService) GetCourseRecommendations(input GetCourseRecommendationsInput) ([]typesenseentity.CourseDocument, error) {
	params := &api.SearchCollectionParams{
		Q:             pointer.String("*"),
		ExcludeFields: pointer.String("course_embedding"),
		VectorQuery: pointer.String(
			fmt.Sprintf("course_embedding:([], distance_threshold: 0.15, k:45, id: %d)", input.CourseID),
		),
	}
	if input.Pagination != nil {
		params.PerPage = &input.Pagination.Size
		params.Page = &input.Pagination.Page
	}

	result, _, err := s.Repo.Search.SearchCourses(params)
	if err != nil {
		return nil, global.Err(err)
	}

	return result, nil
}

func (s *SearchService) GetFilterSuggestions(input GetFilterSuggestionsInput) ([]FilterSuggestionOutput, error) {
	params := &api.SearchCollectionParams{
		Q:              pointer.String("*"),
		FacetBy:        pointer.String(string(input.Field)),
		PerPage:        pointer.Int(0),
		MaxFacetValues: &input.Size,
	}
	if len(input.Query) > 0 {
		params.FacetQuery = pointer.String(fmt.Sprintf("%s:%s", string(input.Field), input.Query))
	}

	facets, err := s.Repo.Search.SearchCoursesFacets(params)
	if err != nil || len(facets) == 0 {
		return []FilterSuggestionOutput{}, global.Err(err)
	}

	suggestions := make([]FilterSuggestionOutput, 0, len(*facets[0].Counts))
	for _, facet := range *facets[0].Counts {
		suggestions = append(suggestions, FilterSuggestionOutput{
			Name:  *facet.Value,
			Count: *facet.Count,
		})
	}

	return suggestions, nil
}

func (s *SearchService) GetTopCourses(input GetTopCoursesInput) ([]typesenseentity.CourseDocument, error) {
	params := &api.SearchCollectionParams{
		Q:             pointer.String("*"),
		ExcludeFields: pointer.String("course_embedding"),
		SortBy:        pointer.String("totalPurchases:desc"),
		PerPage:       pointer.Int(input.Size),
	}

	result, _, err := s.Repo.Search.SearchCourses(params)
	if err != nil {
		return nil, global.Err(err)
	}

	views := make([]analytics.CourseViewsRaw, 0, len(result))
	for _, doc := range result {
		docIDNum, err := strconv.ParseInt(doc.ID, 10, 64)
		if err != nil {
			continue
		}

		views = append(views, analytics.CourseViewsRaw{
			CourseID:   entitycommon.Id(docIDNum),
			Device:     input.UserAnalytics.DeviceType,
			ViewSource: analytics.CourseViewsSourceSearch,
			UserSex:    input.UserAnalytics.UserSex,
			UserID:     input.UserAnalytics.UserId,
			BirthDate:  input.UserAnalytics.BirthDate,
			Seen:       false,
		})
	}
	if len(views) > 0 {
		s.Repo.Analytics.Create(&analytics.CourseViewsRaw{}, views)
	}

	return result, nil
}

func buildCourseSortBy(sortBy *entity.CourseSortBy, sortOrder *utils.SortOrder) string {
	if sortBy == nil {
		return ""
	}

	order := utils.SortOrderDesc
	if sortOrder != nil {
		order = *sortOrder
	}

	if *sortBy == entity.CourseSortByTrending {
		now := time.Now().Unix()
		now30daysAgo := now - (30 * 24 * 60 * 60)
		now7daysAgo := now - (7 * 24 * 60 * 60)

		return fmt.Sprintf(
			`_text_match:%s,_eval([(updatedAt:>%d):4,(updatedAt:>%d):3,(avgRating:>4):2,(totalPurchases:>1000):1]):%s`,
			*sortOrder, now7daysAgo, now30daysAgo, *sortOrder,
		)
	}

	return fmt.Sprintf("%s:%s", string(*sortBy), string(order))
}

func buildCourseFilterBy(input SearchCoursesInput) string {
	filters := []string{}

	appendStringListFilter(&filters, "lectureAccesibility", toStringSlice(input.LectureAccesibility))
	appendStringListFilter(&filters, "language", toStringSlice(input.Language))
	appendStringListFilter(&filters, "tags", input.Tags)
	appendStringListFilter(&filters, "author", input.Author)

	appendRangeFilterInt32(&filters, "discountedPrice", input.MinDiscountedPrice, input.MaxDiscountedPrice)
	appendRangeFilterFloat64(&filters, "avgRating", input.MinAvgRating, nil)

	return strings.Join(filters, " && ")
}

func appendStringListFilter(filters *[]string, field string, values []string) {
	if len(values) == 0 {
		return
	}

	escaped := make([]string, len(values))
	for i, value := range values {
		escaped[i] = fmt.Sprintf("`%s`", strings.ReplaceAll(value, "`", "\\`"))
	}

	*filters = append(*filters, fmt.Sprintf("%s:=[%s]", field, strings.Join(escaped, ",")))
}

func appendRangeFilterInt32(filters *[]string, field string, min *int32, max *int32) {
	if min != nil {
		*filters = append(*filters, fmt.Sprintf("%s:>=%d", field, *min))
	}
	if max != nil {
		*filters = append(*filters, fmt.Sprintf("%s:<=%d", field, *max))
	}
}

func appendRangeFilterFloat64(filters *[]string, field string, min *float64, max *float64) {
	if min != nil {
		*filters = append(*filters, fmt.Sprintf("%s:>=%f", field, *min))
	}
	if max != nil {
		*filters = append(*filters, fmt.Sprintf("%s:<=%f", field, *max))
	}
}

func toStringSlice[T ~string](values []T) []string {
	result := make([]string, len(values))
	for i, value := range values {
		result[i] = string(value)
	}
	return result
}
