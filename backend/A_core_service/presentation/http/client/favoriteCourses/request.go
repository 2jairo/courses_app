package favoritecourses

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type SetFavoriteRequest struct {
	Params struct {
		CourseId int64
	}
	Query struct {
		New bool `query:"new"`
	}
}

func (self *SetFavoriteRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := u.DefaultBind(&self.Query, ctx.QueryParser); err != nil {
		return err
	}
	return u.DefaultBind(&self.Params, ctx.ParamsParser)
}
