package coursetags

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

// Define request structs for courseTags endpoints here

type GetTagsRequest struct {
	Query struct {
		utils.Pagination
		QueryByName string `query:"q" json:"q" validate:"min=2,max=30"`
	}
}

func (self *GetTagsRequest) bind(u *utils.AppUtils, ctx *fiber.Ctx) error {
	return u.DefaultBind(&self.Query, ctx.QueryParser)
}
