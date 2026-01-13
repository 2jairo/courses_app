package files

import (
	"io"
	"mime"
	"mime/multipart"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

type UploadFilesRequest struct {
	Multipart   *multipart.Reader
	QueryParams struct {
		CourseSlug string `json:"courseSlug" validate:"required"`
	}
}

type GetFilesRequest struct {
	PathParams struct {
		CourseSlug string
	}
}

func (self *UploadFilesRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
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
	limitedBodyStream := io.LimitReader(bodyStream, config.FilesMultipartSizeLimit) //TODO: sometimes ECONNRESET: Request Header Fields Too Large causes
	self.Multipart = multipart.NewReader(limitedBodyStream, boundary)

	//QueryParams
	return state.DefaultBind(&self.QueryParams, ctx.QueryParser)
}

func (self *GetFilesRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	return state.DefaultBind(&self.PathParams, ctx.ParamsParser)
}
