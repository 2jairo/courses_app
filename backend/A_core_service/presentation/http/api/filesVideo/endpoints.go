package filesvideo

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	filevideo "github.com/2jairo/courses_app/backend/A_core_service/application/services/fileVideo"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type FilesVideoEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *FilesVideoEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())
	canRead := self.Services.Middleware.HasRole(entity.CoursePermissionsRoleRead)

	r.Get("/:fileId", canRead, self.GetVideoDetails)
}

func (self *FilesVideoEndpoints) GetVideoDetails(ctx *fiber.Ctx) error {
	c := &GetVideoDetailsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	output, err := self.Services.FileVideo.GetVideoDetails(
		filevideo.GetVideoDetailsInput{
			FileID: entitycommon.Id(c.Path.FileId),
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(output.File))
}
