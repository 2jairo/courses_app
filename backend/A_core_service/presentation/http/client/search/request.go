package search

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/typesenseentity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type SearchCoursesRequest struct {
	Query struct {
		utils.Pagination
		SearchMode          entitycommon.SearchMode              `query:"mode" json:"mode" validate:"omitempty,enum"`
		QueryByTitle        string                               `query:"q" json:"q" validate:"omitempty,min=2,max=100"`
		LectureAccesibility entity.CourseLectureAccesibilityList `query:"lectureAccesibility" json:"lectureAccesibility" validate:"enum,unique"`
		Language            entity.CourseLanguageList            `query:"language" json:"language" validate:"enum,unique"`
		Tags                []string                             `query:"tags" json:"tags" validate:"omitempty,unique,dive,min=1,max=120"`
		Author              []string                             `query:"author" json:"author" validate:"omitempty,unique,dive,min=3,max=100"`
		MinDiscountedPrice  *int32                               `query:"minDiscountedPrice" json:"minPrice" validate:"omitempty,min=0"`
		MaxDiscountedPrice  *int32                               `query:"maxDiscountedPrice" json:"maxPrice" validate:"omitempty,min=0"`
		MinAvgRating        *float64                             `query:"minAvgRating" json:"minAvgRating" validate:"omitempty,min=0,max=5"`
		SortOrder           *utils.SortOrder                     `query:"sortOrder" json:"sortOrder" validate:"omitempty,enum"`
		SortBy              *entity.CourseSortBy                 `query:"sortBy" json:"sortBy" validate:"omitempty,enum"`
	}
}

func (self *SearchCoursesRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(&self.Query, ctx.QueryParser)
}

type SearchCoursesAutocomplete struct {
	Query struct {
		QueryByTitle string `query:"q"`
	}
}

func (self *SearchCoursesAutocomplete) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(&self.Query, ctx.QueryParser)
}

type GetCourseRecommendationsRequest struct {
	Query struct {
		utils.Pagination
	}
	Params struct {
		CourseID int64 `params:"courseId" validate:"required,min=1"`
	}
}

func (self *GetCourseRecommendationsRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Params, ctx.ParamsParser); err != nil {
		return global.Err(err)
	}
	return u.DefaultBind(&self.Query, ctx.QueryParser)
}

type GetFilterSuggestionsRequest struct {
	Query struct {
		Field        typesenseentity.FacetableFields `query:"field" json:"field" validate:"required,enum"`
		QueryByTitle string                          `query:"q" json:"q"`
	}
}

func (self *GetFilterSuggestionsRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(&self.Query, ctx.QueryParser)
}

type GetTopCoursesRequest struct {
}

func (self *GetTopCoursesRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return nil
}
