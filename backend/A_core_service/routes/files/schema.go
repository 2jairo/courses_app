package files

import (
	"io"
	"mime"
	"mime/multipart"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
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

type UploadFilesResponse struct {
	CreatedAt    time.Time               `json:"createdAt"`
	Status       entity.FileStatus       `json:"status"`
	Kind         entity.FileKind         `json:"kind"`
	OriginalName string                  `json:"originalName"`
	FileSize     int64                   `json:"fileSize"`
	Metadata     any                     `json:"metadata"`
	User         UploadFilesResponseUser `json:"user"`
}
type UploadFilesResponseUser struct {
	Username string  `json:"username"`
	ID       int64   `json:"id"`
	Avatar   *string `json:"avatar"`
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

func filesResponse(uploadedFiles []entity.File) []UploadFilesResponse {
	resp := make([]UploadFilesResponse, len(uploadedFiles))

	for i, file := range uploadedFiles {
		resp[i] = UploadFilesResponse{
			CreatedAt:    file.CreatedAt,
			Status:       file.Status,
			Kind:         file.Kind,
			OriginalName: file.OriginalName,
			FileSize:     file.FileSize,
			Metadata:     file.Metadata,
			User: UploadFilesResponseUser{
				Username: file.User.Username,
				ID:       file.User.ID,
				Avatar:   file.User.Avatar,
			},
		}
	}

	return resp
}

func (self *UploadFilesRequest) getResponse(uploadedFiles []entity.File) []UploadFilesResponse {
	return filesResponse(uploadedFiles)
}

func (self *GetFilesRequest) getResponse(uploadedFiles []entity.File) []UploadFilesResponse {
	return filesResponse(uploadedFiles)
}
