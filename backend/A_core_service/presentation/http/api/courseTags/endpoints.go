package coursetags

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	coursetags "github.com/2jairo/courses_app/backend/A_core_service/application/services/courseTags"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type CourseTagsEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *CourseTagsEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())

	r.Get("/", self.GetTags)
}

func (self *CourseTagsEndpoints) GetTags(ctx *fiber.Ctx) error {
	c := &GetTagsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	tags, err := self.Services.CourseTags.GetTags(
		coursetags.GetTagsInput{
			Pagination:  &c.Query.Pagination,
			QueryByName: c.Query.QueryByName,
		},
	)
	if err != nil {
		return global.Err(err)
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(tags))
}
