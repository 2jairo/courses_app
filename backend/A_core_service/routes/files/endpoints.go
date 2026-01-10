package files

import (
	"io"
	"os"
	"path"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/middleware"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type FilesEndpoints struct {
	State *state.AppState
}

func (self *FilesEndpoints) RegisterRoutes(r fiber.Router) {
	r.Post("/upload", self.State.AuthMiddleware.ClientAuth(), self.UploadCourseFiles)
	r.Get("/:courseSlug", self.State.AuthMiddleware.ClientAuth(), self.GetCourseFiles)
}

func (self *FilesEndpoints) UploadCourseFiles(ctx *fiber.Ctx) error {
	c := &UploadFilesRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	userJwtClaims := ctx.Locals(middleware.LocalsMwJwtClaims).(*utils.ClientJwtClaims)

	course := &entity.Course{Slug: entity.Slug{Slug: c.QueryParams.CourseSlug}}
	if err := self.State.CourseRepository.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
		return err
	}

	uploadedFiles := []entity.File{}

	for {
		part, err := c.Multipart.NextPart()
		if err != nil {
			if err == io.EOF {
				break
			}
			return &localerror.LocalError{Err: localerror.ErrKindTooLarge, Status: fiber.StatusRequestEntityTooLarge}
		}

		fileKind := entity.FileKind(part.FormName())
		if !fileKind.IsValid() {
			fileKind = entity.FileKindOther
		}

		rawFileName := utils.GenerateUUID()
		rawFilePath := path.Join(config.RawFilesBasePath, rawFileName)

		file, err := os.Create(rawFilePath)
		if err != nil {
			return err
		}

		fileSize, err := io.Copy(file, part)
		if err != nil {
			return err
		}
		if err := file.Close(); err != nil {
			return err
		}

		fileEntity := entity.File{
			UserID:       userJwtClaims.UserId,
			CourseID:     course.ID,
			Kind:         fileKind,
			Status:       entity.FileStatusPending,
			OriginalName: part.FileName(),
			FileSize:     fileSize,
			RawFileName:  rawFileName,
		}

		if err := self.State.FileRepository.Create(&fileEntity, entity.FilePreloadOptions{User: true}); err != nil {
			os.Remove(rawFilePath)
			return err
		}
		if err := self.State.FileRepository.NotifyCService(&fileEntity); err != nil {
			return err
		}

		uploadedFiles = append(uploadedFiles, fileEntity)
	}

	return ctx.Status(200).JSON(c.getResponse(uploadedFiles))
}

func (self *FilesEndpoints) GetCourseFiles(ctx *fiber.Ctx) error {
	c := &GetFilesRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	course := &entity.Course{Slug: entity.Slug{Slug: c.PathParams.CourseSlug}}
	if err := self.State.CourseRepository.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
		return err
	}

	fileFindBy := &entity.File{CourseID: course.ID}
	filePreload := entity.FilePreloadOptions{User: true}
	files, err := self.State.FileRepository.Find(fileFindBy, filePreload)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(files))
}
