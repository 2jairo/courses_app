package files

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/file"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type FilesEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *FilesEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())
	canWrite := self.Services.Middleware.HasRole(entity.CoursePermissionsRoleWrite)
	canRead := self.Services.Middleware.HasRole(entity.CoursePermissionsRoleRead)

	r.Post("/upload", canWrite, self.UploadCourseFiles)
	r.Post("/upload-image", canWrite, self.UploadImage)
	r.Get("/:courseId", canRead, self.GetCourseFiles)
}

func (self *FilesEndpoints) UploadCourseFiles(ctx *fiber.Ctx) error {
	c := &UploadFilesRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	output, err := self.Services.File.UploadCourseFiles(
		file.UploadCourseFilesInput{
			CourseID:  entitycommon.Id(c.Query.CourseId),
			UserID:    entitycommon.Id(userJwtClaims.UserId),
			Multipart: c.Multipart,
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(output.Files))
}

func (self *FilesEndpoints) GetCourseFiles(ctx *fiber.Ctx) error {
	c := &GetFilesRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}
	output, err := self.Services.File.GetCourseFiles(
		file.GetCourseFilesInput{
			CourseID:     entitycommon.Id(c.Path.CourseId),
			Kind:         c.Query.Kind,
			Status:       c.Query.Status,
			QueryByTitle: c.Query.QueryByTitle,
			SortOrder:    c.Query.SortOrder,
			SortBy:       c.Query.SortBy,
			Pagination:   c.Query.Pagination,
			UserNames:    c.Query.User,
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(output.Files))
}

func (self *FilesEndpoints) UploadImage(ctx *fiber.Ctx) error {
	c := &UploadImageRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	output, err := self.Services.File.UploadImage(
		file.UploadImageInput{
			CourseID:  entitycommon.Id(c.Query.CourseId),
			UserID:    entitycommon.Id(userJwtClaims.UserId),
			Multipart: c.Multipart,
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(output.File))
}
