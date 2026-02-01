package filesvideo

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

type FilesVideoEndpoints struct {
	State *state.AppState
}

func (self *FilesVideoEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.State.AuthMiddleware.ClientAuth())
	canRead := self.State.CourseRoleMiddleware.HasRole(entity.CoursePermissionsRoleRead)

	r.Get("/:fileId", canRead, self.GetVideoDetails)
}

func (self *FilesVideoEndpoints) GetVideoDetails(ctx *fiber.Ctx) error {
	c := &GetVideoDetailsRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	file := &entity.File{Model: entitycommon.Model{ID: c.Path.FileId}}
	if err := self.State.FileRepository.FindOne(file, entity.FilePreloadOptions{User: true}); err != nil {
		return err
	}

	if file.Kind != entity.FileKindVideo {
		return &localerror.LocalError{Err: localerror.ErrKindBadRequest, Status: fiber.StatusBadRequest}
	}

	return ctx.Status(200).JSON(c.getResponse(file))
}
