package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/typesenseentity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/mitchellh/mapstructure"
	"github.com/typesense/typesense-go/v4/typesense/api"
	"github.com/typesense/typesense-go/v4/typesense/api/pointer"
)

const SYSTEM_PROMPT_TEMPLATE = `You are given the database schema structure below. Your task is to extract relevant search parameters from the user's natural language query and return them in the exact JSON format specified.

Database Schema:
Table fields are listed in the format: [Field Name] [Data Type] [Is Indexed] [Is Faceted] [Enum Values]

| Field Name          | Data Type | Is Indexed | Is Faceted | Enum Values |
|---------------------|-----------|------------|------------|-------------|
%s

Instructions:
1. Extract the user's core search intent as a text query (q). Remove any terms already captured by structured fields below.
2. Map user intent to the structured fields where possible, using the enum values as a guide even if the user does not use the exact wording.
3. For faceted fields (author, language, lectureAccesibility, tags), map user intent to one or more of the allowed enum values.
4. Price Handling:
   - "minDiscountedPrice" and "maxDiscountedPrice" are stored in the smallest currency unit (e.g., cents).
   - Always convert user-mentioned prices by multiplying by 100.
     Example: "under 10€" → maxDiscountedPrice: 1000
     Example: "between 5€ and 20€" → minDiscountedPrice: 500, maxDiscountedPrice: 2000
5. Rating Handling:
   - "minAvgRating" admits a float between 0 and 5.
   - Example: "rated above 4" → minAvgRating: 4.0
6. Sorting:
   - "sortBy" must be one of: [discountedPrice, avgRating, totalReviews, totalPurchases, updatedAt, lecturesAmmount]
   - "sortOrder" must be one of: [asc, desc]
   - Only set these when the user explicitly or clearly implies an ordering preference.
     Example: "cheapest courses" → sortBy: "discountedPrice", sortOrder: "asc"
     Example: "best rated" → sortBy: "avgRating", sortOrder: "desc"
     Example: "most popular" → sortBy: "totalPurchases", sortOrder: "desc"
     Example: "newest" → sortBy: "updatedAt", sortOrder: "desc"
7. Query (q) Behavior:
   - Only include in "q" terms that cannot be mapped to any structured field.
   - If no meaningful full-text terms remain after extracting structured fields, set "q": "*".
   - NEVER leave "q" as an empty string. Minimum length is 2 characters, so use "*" as the fallback.
   - Do not repeat in "q" any concept already captured in tags, author, language, or other fields.
8. Omit any field from the output JSON if it has no value (do not include null fields). Exception: "q" is always required.
9. Always output only the JSON object with no explanation or extra text.

Output Format:
{
  "q": "<core search text or * if none>",
  "lectureAccesibility": ["<value1>"],
  "language": ["<value1>"],
  "tags": ["<value1>", "<value2>"],
  "author": ["<value1>"],
  "minDiscountedPrice": <integer in cents>,
  "maxDiscountedPrice": <integer in cents>,
  "minAvgRating": <float 0-5>,
  "sortBy": "<field name>",
  "sortOrder": "<asc|desc>"
}`

var SYSTEM_PROMPT string

type SearchRepository struct {
	Db       *db.DatabasesConnection
	CachedAt *time.Time
}

func (self *SearchRepository) updateSystemPrompt() error {
	refreshInterval := time.Duration(config.TypesenseSystemPromptRefreshInterval) * time.Minute
	if self.CachedAt != nil && time.Since(*self.CachedAt) < refreshInterval {
		return nil
	}

	courseSchema := typesenseentity.CourseSchema()
	facetableFields := make([]api.Field, 0, len(courseSchema.Fields))
	rows := make([]string, 0, len(courseSchema.Fields))

	for _, field := range courseSchema.Fields {
		if field.Facet != nil && *field.Facet {
			facetableFields = append(facetableFields, field)
			continue
		}

		rows = append(rows, buildSchemaRow(field, []string{}))
	}

	facetValueMap, err := self.fetchFacetValues(courseSchema.Name, facetableFields)
	if err != nil {
		return global.Err(err)
	}
	for _, field := range facetableFields {
		rows = append(rows, buildSchemaRow(field, facetValueMap[field.Name]))
	}

	SYSTEM_PROMPT = fmt.Sprintf(SYSTEM_PROMPT_TEMPLATE, strings.Join(rows, "\n"))
	self.CachedAt = utils.Ref(time.Now())

	return nil
}

func (self *SearchRepository) fetchFacetValues(collectionName string, facetableFields []api.Field) (map[string][]string, error) {
	facetValues := make(map[string][]string, len(facetableFields))

	if len(facetableFields) == 0 {
		return facetValues, nil
	}

	facetBy := make([]string, 0, len(facetableFields))
	for _, field := range facetableFields {
		facetBy = append(facetBy, field.Name)
	}

	result, err := self.Db.Typesense.
		Collection(collectionName).
		Documents().
		Search(context.TODO(), &api.SearchCollectionParams{
			Q:              pointer.String("*"),
			FacetBy:        pointer.String(strings.Join(facetBy, ",")),
			MaxFacetValues: pointer.Int(int(config.TypesenseSystemPromptMaxFacetValues) + 1),
			PerPage:        pointer.Int(0),
		})
	if err != nil {
		return nil, global.Err(err)
	}

	for _, facet := range *result.FacetCounts {
		values := make([]string, 0, len(*facet.Counts))
		for _, count := range *facet.Counts {
			values = append(values, *count.Value)
		}

		facetValues[*facet.FieldName] = values
	}

	return facetValues, nil
}

func buildSchemaRow(field api.Field, enums []string) string {
	enumValues := "N/A"

	if len(enums) > 0 {
		enumValues = strings.Join(enums, "; ")

		if len(enums) > int(config.TypesenseSystemPromptMaxFacetValues) {
			enumValues += "; ..."
		}
	}

	return fmt.Sprintf(
		"| %s | %s | %s | %s | %s |",
		field.Name,
		field.Type,
		utils.BooleanToYesNo(field.Index == nil || *field.Index),
		utils.BooleanToYesNo(field.Facet != nil && *field.Facet),
		enumValues,
	)
}

func (self *SearchRepository) GenerateFiltersFromNlPrompt(q string) (*db.GatewayIaSearchGenerateResponseFilters, error) {
	if err := self.updateSystemPrompt(); err != nil {
		return nil, global.Err(err)
	}

	ctx, cancel := context.WithTimeout(context.TODO(), time.Duration(config.TypesenseNlQueryMaxMs)*time.Millisecond)
	defer cancel()

	return self.Db.GatewayIASearch.Generate(ctx, db.GatewayIASearchGenreateRequest{
		MaxTokens: 8192,
		Messages: []db.GatewayIASearchMessage{
			{Role: db.RoleSystem, Content: SYSTEM_PROMPT},
			{Role: db.RoleUser, Content: q},
		},
	})
}

func (self *SearchRepository) SearchCourses(params *api.SearchCollectionParams) ([]typesenseentity.CourseDocument, int, error) {
	result, err := self.Db.Typesense.Collection("courses").Documents().Search(context.TODO(), params)
	if err != nil {
		return nil, 0, global.Err(err)
	}
	if result.Hits == nil || *result.Found == 0 {
		return []typesenseentity.CourseDocument{}, 0, nil
	}

	courses := make([]typesenseentity.CourseDocument, 0, len(*result.Hits))
	for _, hit := range *result.Hits {
		var doc typesenseentity.CourseDocument
		if err := mapstructure.Decode(hit.Document, &doc); err == nil {
			courses = append(courses, doc)
		}
	}

	return courses, *result.Found, nil
}

func (self *SearchRepository) SearchCoursesFacets(params *api.SearchCollectionParams) ([]api.FacetCounts, error) {
	result, err := self.Db.Typesense.Collection("courses").Documents().Search(context.TODO(), params)
	if err != nil {
		return nil, global.Err(err)
	}
	if result.Hits == nil || *result.Found == 0 {
		return []api.FacetCounts{}, nil
	}

	return *result.FacetCounts, nil
}
