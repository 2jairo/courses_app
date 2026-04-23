package files

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	coursepermissions "github.com/2jairo/courses_app/backend/A_core_service/application/services/coursePermissions"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/file"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type FilesEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *FilesEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())

	r.Post("/upload", self.UploadCourseFiles) // Write
	r.Post("/upload-image", self.UploadImage) // Write
	r.Get("/:courseId", self.GetCourseFiles)  // Read
}

func (self *FilesEndpoints) UploadCourseFiles(ctx *fiber.Ctx) error {
	c := &UploadFilesRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}
	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRole(
		coursepermissions.HasRoleInput{
			CourseId:      entitycommon.Id(c.Query.CourseId),
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleWrite,
		},
	); err != nil {
		return global.Err(err)
	}

	output, err := self.Services.File.UploadCourseFiles(
		file.UploadCourseFilesInput{
			CourseID:  entitycommon.Id(c.Query.CourseId),
			UserID:    entitycommon.Id(userJwtClaims.UserId),
			Multipart: c.Multipart,
		},
	)
	if err != nil {
		return global.Err(err)
	}

	return ctx.Status(200).JSON(c.getResponse(output.Files))
}

func (self *FilesEndpoints) GetCourseFiles(ctx *fiber.Ctx) error {
	c := &GetFilesRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRole(
		coursepermissions.HasRoleInput{
			CourseId:      entitycommon.Id(c.Path.CourseId),
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleRead,
		},
	); err != nil {
		return global.Err(err)
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
		return global.Err(err)
	}

	return ctx.Status(200).JSON(c.getResponse(output.Files))
}

func (self *FilesEndpoints) UploadImage(ctx *fiber.Ctx) error {
	c := &UploadImageRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return global.Err(err)
	}

	userJwtClaims := self.Services.Middleware.GetClientJwtClaims(ctx)
	if err := self.Services.CoursePermissions.HasRole(
		coursepermissions.HasRoleInput{
			CourseId:      entitycommon.Id(c.Query.CourseId),
			UserJwtClaims: userJwtClaims,
			MinRole:       entity.CoursePermissionsRoleWrite,
		},
	); err != nil {
		return global.Err(err)
	}

	output, err := self.Services.File.UploadImage(
		file.UploadImageInput{
			CourseID:  entitycommon.Id(c.Query.CourseId),
			UserID:    entitycommon.Id(userJwtClaims.UserId),
			Multipart: c.Multipart,
		},
	)
	if err != nil {
		return global.Err(err)
	}

	return ctx.Status(200).JSON(c.getResponse(output.File))
}
