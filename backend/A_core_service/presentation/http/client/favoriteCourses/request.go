package favoritecourses

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type GetFavoriteCoursesRequest struct {
	Query struct {
		utils.Pagination
	}
}

func (self *GetFavoriteCoursesRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(&self.Query, ctx.QueryParser)
}

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
		return global.Err(err)
	}
	return u.DefaultBind(&self.Params, ctx.ParamsParser)
}
