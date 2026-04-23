package filesvideo

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	coursepermissions "github.com/2jairo/courses_app/backend/A_core_service/application/services/coursePermissions"
	filevideo "github.com/2jairo/courses_app/backend/A_core_service/application/services/fileVideo"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type FilesVideoEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *FilesVideoEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())

	r.Get("/:fileId", self.GetVideoDetails) // Read
}

func (self *FilesVideoEndpoints) GetVideoDetails(ctx *fiber.Ctx) error {
	c := &GetVideoDetailsRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	output, err := self.Services.FileVideo.GetVideoDetails(
		filevideo.GetVideoDetailsInput{
			FileID: entitycommon.Id(c.Path.FileId),
		},
	)
	if err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRole(
		coursepermissions.HasRoleInput{
			CourseId:      output.File.CourseID,
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleRead,
		},
	); err != nil {
		return global.Err(err)
	}

	return ctx.Status(200).JSON(c.getResponse(output.File))
}
