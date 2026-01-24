package files

import (
	"io"
	"mime"
	"mime/multipart"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
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
		Kind         *entity.FileKind   `query:"kind" json:"kind" validate:"omitempty,enum"`
		Status       *entity.FileStatus `query:"status" json:"status" validate:"omitempty,enum"`
		QueryByTitle string             `query:"q" json:"q" validate:"omitempty,min=3"`
	}
	Path struct {
		CourseId int64
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
	return state.DefaultBind(&self.Query, ctx.QueryParser)
}

func (self *GetFilesRequest) bind(state *state.AppState, ctx *fiber.Ctx) error {
	if err := state.DefaultBind(&self.Query, ctx.QueryParser); err != nil {
		return err
	}
	return state.DefaultBind(&self.Path, ctx.ParamsParser)
}
