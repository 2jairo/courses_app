package files

import (
	"io"
	"mime/multipart"
	"os"
	"path"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
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
	r.Use(self.State.AuthMiddleware.ClientAuth())
	canWrite := self.State.CourseRoleMiddleware.HasRole(entity.CoursePermissionsRoleWrite)
	canRead := self.State.CourseRoleMiddleware.HasRole(entity.CoursePermissionsRoleRead)

	r.Post("/upload", canWrite, self.UploadCourseFiles)
	r.Get("/:courseId", canRead, self.GetCourseFiles)
}

func (self *FilesEndpoints) UploadCourseFiles(ctx *fiber.Ctx) error {
	c := &UploadFilesRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	userJwtClaims := ctx.Locals(middleware.LocalsMwJwtClaims).(*utils.ClientJwtClaims)

	course := &entity.Course{Model: entitycommon.Model{ID: c.Query.CourseId}}
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

		fileEntity := entity.File{}
		if err := self.handlePart(part, &fileEntity, course, userJwtClaims); err != nil {
			//continue
			return err
		}
		uploadedFiles = append(uploadedFiles, fileEntity)
	}

	return ctx.Status(200).JSON(c.getResponse(uploadedFiles))
}

func (self *FilesEndpoints) handlePart(
	part *multipart.Part,
	fileEntity *entity.File,
	course *entity.Course,
	userJwtClaims *utils.ClientJwtClaims,
) error {
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

	*fileEntity = entity.File{
		UserID:       userJwtClaims.UserId,
		CourseID:     course.ID,
		Kind:         fileKind,
		Status:       entity.FileStatusPending,
		OriginalName: part.FileName(),
		FileSize:     fileSize,
		RawFileName:  rawFileName,
	}

	if err := self.State.FileRepository.Create(fileEntity, entity.FilePreloadOptions{User: true}); err != nil {
		os.Remove(rawFilePath)
		return err
	}
	if err := self.State.FileRepository.NotifyCService(fileEntity); err != nil {
		return err
	}

	return nil
}

func (self *FilesEndpoints) GetCourseFiles(ctx *fiber.Ctx) error {
	c := &GetFilesRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	users, err := self.State.UserRepository.FindIn(c.Query.User)
	if err != nil {
		return err
	}
	if len(c.Query.User) > len(users) {
		return &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}

	usersId := make([]int64, len(users))
	for i, user := range users {
		usersId[i] = user.ID
	}

	q := ""
	if len(c.Query.QueryByTitle) >= 3 {
		q = c.Query.QueryByTitle
	}

	files, err := self.State.FileRepository.Find(
		&entity.File{CourseID: c.Path.CourseId},
		entity.FilePreloadOptions{User: true},
		c.Query.Kind,
		c.Query.Status,
		usersId,
		q,
		c.Query.SortOrder,
		c.Query.SortBy,
		&c.Query.Pagination,
	)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(files))
}
