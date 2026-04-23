package typesenseentity

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/typesense/typesense-go/v4/typesense/api"
	"github.com/typesense/typesense-go/v4/typesense/api/pointer"
)

type FacetableFields string

const (
	FacetableFieldLectureAccesibility FacetableFields = "lectureAccesibility"
	FacetableFieldLanguage            FacetableFields = "language"
	FacetableFieldTags                FacetableFields = "tags"
	FacetableFieldAuthor              FacetableFields = "author"
)

func (f FacetableFields) IsValid() bool {
	return f == FacetableFieldLectureAccesibility ||
		f == FacetableFieldLanguage ||
		f == FacetableFieldTags ||
		f == FacetableFieldAuthor
}

type CourseDocument struct {
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
	DiscountedPrice     int32    `json:"discountedPrice"`
	DiscountPercent     int32    `json:"discountPercent"`
	Tags                []string `json:"tags"`
	Author              string   `json:"author"`
	AvgRating           float64  `json:"avgRating"`
	TotalReviews        int64    `json:"totalReviews"`
	TotalPurchases      int64    `json:"totalPurchases"`
	TotalViews          int64    `json:"totalViews"`
	TotalImpressions    int64    `json:"totalImpressions"`
}

type CourseDocumentUpdateStats struct {
	AvgRating        float64 `json:"avgRating"`
	TotalReviews     int64   `json:"totalReviews"`
	TotalPurchases   int64   `json:"totalPurchases"`
	TotalViews       int64   `json:"totalViews"`
	TotalImpressions int64   `json:"totalImpressions"`
}

type CourseDocumentUpdateInfo struct {
	Slug                string   `json:"slug"`
	UpdatedAt           int64    `json:"updatedAt"`
	LectureAccesibility string   `json:"lectureAccesibility"`
	Title               string   `json:"title"`
	Description         string   `json:"description"`
	Poster              string   `json:"poster"`
	Language            string   `json:"language"`
	LecturesAmmount     int32    `json:"lecturesAmmount"`
	Price               int32    `json:"price"`
	DiscountedPrice     int32    `json:"discountedPrice"`
	DiscountPercent     int32    `json:"discountPercent"`
	Tags                []string `json:"tags"`
	Author              string   `json:"author"`
}

func CourseSchema() *api.CollectionSchema {
	return &api.CollectionSchema{
		Name:                "courses",
		DefaultSortingField: utils.Ref("totalPurchases"),
		Fields: []api.Field{
			{Name: "id", Type: "string", Index: pointer.False()},
			{Name: "slug", Type: "string", Index: pointer.False()},
			{Name: "updatedAt", Type: "int64"},
			{Name: "lectureAccesibility", Type: "string", Facet: pointer.True()},
			{Name: "title", Type: "string"},
			{Name: "description", Type: "string"},
			{Name: "poster", Type: "string"},
			{Name: "language", Type: "string", Facet: pointer.True()},
			{Name: "lecturesAmmount", Type: "int32"},
			{Name: "price", Type: "int32"},
			{Name: "discountPercent", Type: "int32"},
			{Name: "discountedPrice", Type: "int32"},
			{Name: "tags", Type: "string[]", Facet: pointer.True()},

			{Name: "author", Type: "string", Facet: pointer.True()},
			{Name: "avgRating", Type: "float"},
			{Name: "totalReviews", Type: "int64"},
			{Name: "totalPurchases", Type: "int64"},
			{Name: "totalViews", Type: "int64"},
			{Name: "totalImpressions", Type: "int64"},
			{Name: "course_embedding", Type: "float[]", Embed: &api.FieldEmbed{
				From: []string{"title", "description", "tags"},
				ModelConfig: struct {
					AccessToken    *string "json:\"access_token,omitempty\""
					ApiKey         *string "json:\"api_key,omitempty\""
					ClientId       *string "json:\"client_id,omitempty\""
					ClientSecret   *string "json:\"client_secret,omitempty\""
					IndexingPrefix *string "json:\"indexing_prefix,omitempty\""
					ModelName      string  "json:\"model_name\""
					ProjectId      *string "json:\"project_id,omitempty\""
					QueryPrefix    *string "json:\"query_prefix,omitempty\""
					RefreshToken   *string "json:\"refresh_token,omitempty\""
					Url            *string "json:\"url,omitempty\""
				}{
					ModelName: "ts/multilingual-e5-base",
				},
			}},

			// {Name: "category", Type: "string", Facet: pointer.True()},
			// {Name: "subcategory", Type: "string", Facet: pointer.True()},
			// {Name: "level", Type: "string", Facet: pointer.True()},
			// {Name: "durationMinutes", Type: "int32"},
			// {Name: "requirements", Type: "string[]"},
			// {Name: "created_at", Type: "int64"},
			// {Name: "isPublished", Type: "bool"},
			// {Name: "thumbnailUrl", Type: "string"},
			// {Name: "promoVideoUrl", Type: "string"},
			// {Name: "instructorId", Type: "string"},
			// {Name: "currency", Type: "string"},
			// {Name: "enrollmentDeadline", Type: "int64"},
			// {Name: "certificateAvailable", Type: "bool"},
		},
	}
}
