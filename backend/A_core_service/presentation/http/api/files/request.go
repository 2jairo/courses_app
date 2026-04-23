package files

import (
	"bytes"
	"io"
	"mime"
	"mime/multipart"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
)

type UploadFilesRequest struct {
	Multipart *multipart.Reader
	Query     struct {
		CourseId int64 `json:"courseId" validate:"required"`
	}
}

type GetFilesRequest struct {
	Query struct {
		utils.Pagination
		// Kind         []entity.FileKind     `query:"kind" json:"kind" validate:"omitempty,dive,enum,unique"`
		Kind         entity.FileKindList   `query:"kind" json:"kind" validate:"enum,unique"`
		Status       entity.FileStatusList `query:"status" json:"status" validate:"enum,unique"`
		QueryByTitle string                `query:"q" json:"q" validate:"omitempty,min=3"`
		SortOrder    *utils.SortOrder      `query:"sortOrder" json:"sortOrder" validate:"omitempty,enum"`
		SortBy       *entity.FileSortBy    `query:"sortBy" json:"sortBy" validate:"omitempty,enum"`
		User         []string              `query:"user" json:"user" validate:"unique,dive,min=3"`
	}
	Path struct {
		CourseId int64
	}
}

func (self *UploadFilesRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	//Multipart
	contentType := ctx.Get("Content-Type")
	mediaType, params, err := mime.ParseMediaType(contentType)
	if err != nil || mediaType != "multipart/form-data" {
		return &localerror.LocalError{Err: localerror.ErrKindBadRequest, Status: fiber.StatusBadRequest}
	}

	boundary, ok := params["boundary"]
	if !ok {
		return &localerror.LocalError{Err: localerror.ErrKindBadRequest, Status: fiber.StatusBadRequest}
	}

	bodyStream := ctx.Context().RequestBodyStream()
	if bodyStream == nil {
		bodyStream = bytes.NewReader(ctx.Body())
	}
	limitedBodyStream := io.LimitReader(bodyStream, config.FilesMultipartSizeLimit) //TODO: sometimes ECONNRESET: Request Header Fields Too Large causes
	self.Multipart = multipart.NewReader(limitedBodyStream, boundary)

	//QueryParams
	return utils.DefaultBind(&self.Query, ctx.QueryParser)
}

func (self *GetFilesRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	if err := utils.DefaultBind(&self.Query, ctx.QueryParser); err != nil {
		return global.Err(err)
	}
	return utils.DefaultBind(&self.Path, ctx.ParamsParser)
}

type UploadImageRequest struct {
	Multipart *multipart.Reader
	Query     struct {
		CourseId int64 `json:"courseId" validate:"required"`
	}
}

func (self *UploadImageRequest) bind(utils *utils.AppUtils, ctx *fiber.Ctx) error {
	//Multipart
	contentType := ctx.Get("Content-Type")
	mediaType, params, err := mime.ParseMediaType(contentType)
	if err != nil || mediaType != "multipart/form-data" {
		return &localerror.LocalError{Err: localerror.ErrKindBadRequest, Status: fiber.StatusBadRequest}
	}

	boundary, ok := params["boundary"]
	if !ok {
		return &localerror.LocalError{Err: localerror.ErrKindBadRequest, Status: fiber.StatusBadRequest}
	}

	bodyStream := ctx.Context().RequestBodyStream()
	if bodyStream == nil {
		bodyStream = bytes.NewReader(ctx.Body())
	}
	limitedBodyStream := io.LimitReader(bodyStream, config.FilesMultipartSizeLimit)
	self.Multipart = multipart.NewReader(limitedBodyStream, boundary)

	//QueryParams
	return utils.DefaultBind(&self.Query, ctx.QueryParser)
}
