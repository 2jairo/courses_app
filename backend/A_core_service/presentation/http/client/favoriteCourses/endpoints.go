package favoritecourses

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	favoritecourse "github.com/2jairo/courses_app/backend/A_core_service/application/services/favoriteCourse"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type FavoriteCoursesEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *FavoriteCoursesEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())

	r.Put("/:courseId", self.SetFavorite)
}

func (self *FavoriteCoursesEndpoints) SetFavorite(ctx *fiber.Ctx) error {
	req := &SetFavoriteRequest{}
	if err := req.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.FavoriteCourse.SetFavorite(
		favoritecourse.SetFavoriteInput{
			UserID:   entitycommon.Id(userJwtClaims.UserId),
			CourseID: entitycommon.Id(req.Params.CourseId),
			Add:      req.Query.New,
		},
	); err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}
