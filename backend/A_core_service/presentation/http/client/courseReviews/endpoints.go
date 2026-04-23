package coursereviews

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	coursereview "github.com/2jairo/courses_app/backend/A_core_service/application/services/courseReview"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/middlewares"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type CourseReviewsEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *CourseReviewsEndpoints) RegisterRoutes(r fiber.Router) {
	auth := self.Services.Middleware.ClientAuth()
	authOptional := self.Services.Middleware.ClientAuth(middlewares.ClientAuthParams{Optional: true})

	r.Get("/:courseSlug", authOptional, self.ListReviews)
	r.Post("/:courseSlug", auth, self.CreateReview)
	r.Put("/:reviewId", auth, self.UpdateReview)
}

func (self *CourseReviewsEndpoints) ListReviews(ctx *fiber.Ctx) error {
	c := &ListReviewsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	reviews, err := self.Services.CourseReview.FindNotEmptyReviews(
		coursereview.FindReviewsInput{
			CourseSlug: c.Params.CourseSlug,
			Pagination: &c.Query.Pagination,
			Rating:     c.Query.Rating,
		},
	)
	if err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(reviews, userJwtClaims))
}

func (self *CourseReviewsEndpoints) CreateReview(ctx *fiber.Ctx) error {
	c := &CreateReviewRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	review, err := self.Services.CourseReview.CreateReview(
		coursereview.CreateReviewInput{
			UserID:     entitycommon.Id(userJwtClaims.UserId),
			CourseSlug: c.Params.CourseSlug,
			Rating:     c.Body.Rating,
			Comment:    c.Body.Comment,
		},
	)
	if err != nil {
		return global.Err(err)
	}

	return ctx.Status(fiber.StatusCreated).JSON(c.getResponse(review, userJwtClaims))
}

func (self *CourseReviewsEndpoints) UpdateReview(ctx *fiber.Ctx) error {
	c := &UpdateReviewRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	review, err := self.Services.CourseReview.UpdateReview(
		coursereview.UpdateReviewInput{
			ReviewID: entitycommon.Id(c.Params.ReviewID),
			UserID:   entitycommon.Id(userJwtClaims.UserId),
			Rating:   c.Body.Rating,
			Comment:  c.Body.Comment,
		},
	)
	if err != nil {
		return global.Err(err)
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(review, userJwtClaims))
}
