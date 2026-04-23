package search

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	analyticsservice "github.com/2jairo/courses_app/backend/A_core_service/application/services/analytics"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/middlewares"
	searchservice "github.com/2jairo/courses_app/backend/A_core_service/application/services/search"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type SearchEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *SearchEndpoints) RegisterRoutes(r fiber.Router) {
	optionalAuth := self.Services.Middleware.ClientAuth(middlewares.ClientAuthParams{Optional: true})
	ua := self.Services.Middleware.GuessUADeviceType()

	r.Get("/", optionalAuth, ua, self.SearchCourses)
	r.Get("/autocomplete", self.SearchCoursesAutocomplete)
	r.Get("/recommendations/:courseId", self.GetCourseRecommendations)
	r.Get("/suggestions", self.GetFilterSuggestions)
	r.Get("/top-courses", optionalAuth, ua, self.GetTopCourses)
}

func (self *SearchEndpoints) SearchCourses(ctx *fiber.Ctx) error {
	c := &SearchCoursesRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	deviceType := self.Services.Middleware.GetUADeviceType(ctx)
	userAnalytics := searchservice.SearchCoursesUserAnalytics{}

	if deviceType != nil {
		userAnalytics.DeviceType = *deviceType
	}
	if userJwtClaims != nil {
		userAnalytics.UserSex = utils.Ref(entity.UserSex(userJwtClaims.Analytics.Sex))
		userAnalytics.BirthDate = &userJwtClaims.Analytics.BirthDate
		userAnalytics.UserId = (*entitycommon.Id)(&userJwtClaims.UserId)
	}

	output, err := self.Services.Search.SearchCourses(
		searchservice.SearchCoursesInput{
			Pagination:          &c.Query.Pagination,
			SearchMode:          c.Query.SearchMode,
			QueryByTitle:        c.Query.QueryByTitle,
			LectureAccesibility: c.Query.LectureAccesibility,
			Language:            c.Query.Language,
			Tags:                c.Query.Tags,
			Author:              c.Query.Author,
			MinDiscountedPrice:  c.Query.MinDiscountedPrice,
			MaxDiscountedPrice:  c.Query.MaxDiscountedPrice,
			MinAvgRating:        c.Query.MinAvgRating,
			SortOrder:           c.Query.SortOrder,
			SortBy:              c.Query.SortBy,
			UserAnalytics:       userAnalytics,
		},
	)
	if err != nil {
		return global.Err(err)
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(output))
}

func (self *SearchEndpoints) SearchCoursesAutocomplete(ctx *fiber.Ctx) error {
	c := &SearchCoursesAutocomplete{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	popular := []analytics.CourseSearchQueriesRecent{}
	titles := []string{}

	if c.Query.QueryByTitle == "" {
		popularInner, err := self.Services.Analytics.GetTopSearchQueriesByPrefix(
			analyticsservice.GetTopSearchQueriesByPrefixInput{
				Prefix: "",
				Limit:  10,
			},
		)
		if err != nil {
			return global.Err(err)
		}
		popular = popularInner
	} else {
		titlesInner, err := self.Services.Search.GetTopCourseTitles(
			searchservice.GetTopCourseTitlesInput{
				Query:      c.Query.QueryByTitle,
				Pagination: &utils.Pagination{Page: 1, Size: 10},
			},
		)
		if err != nil {
			return global.Err(err)
		}
		titles = titlesInner
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(popular, titles))
}

func (self *SearchEndpoints) GetCourseRecommendations(ctx *fiber.Ctx) error {
	c := &GetCourseRecommendationsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	courses, err := self.Services.Search.GetCourseRecommendations(
		searchservice.GetCourseRecommendationsInput{
			CourseID:   entitycommon.Id(c.Params.CourseID),
			Pagination: &c.Query.Pagination,
		},
	)
	if err != nil {
		return global.Err(err)
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(courses))
}

func (self *SearchEndpoints) GetFilterSuggestions(ctx *fiber.Ctx) error {
	c := &GetFilterSuggestionsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	suggestions, err := self.Services.Search.GetFilterSuggestions(
		searchservice.GetFilterSuggestionsInput{
			Query: c.Query.QueryByTitle,
			Field: c.Query.Field,
			Size:  15,
		},
	)
	if err != nil {
		return global.Err(err)
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(suggestions))
}

func (self *SearchEndpoints) GetTopCourses(ctx *fiber.Ctx) error {
	c := &GetTopCoursesRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	deviceType := self.Services.Middleware.GetUADeviceType(ctx)
	userAnalytics := searchservice.SearchCoursesUserAnalytics{}

	if deviceType != nil {
		userAnalytics.DeviceType = *deviceType
	}
	if userJwtClaims != nil {
		userAnalytics.UserSex = utils.Ref(entity.UserSex(userJwtClaims.Analytics.Sex))
		userAnalytics.BirthDate = &userJwtClaims.Analytics.BirthDate
		userAnalytics.UserId = (*entitycommon.Id)(&userJwtClaims.UserId)
	}

	courses, err := self.Services.Search.GetTopCourses(
		searchservice.GetTopCoursesInput{
			Size:          4,
			UserAnalytics: userAnalytics,
		},
	)
	if err != nil {
		return global.Err(err)
	}

	return ctx.Status(200).JSON(c.getResponse(courses))
}
