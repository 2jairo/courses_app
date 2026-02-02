package lectureassets

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	lectureasset "github.com/2jairo/courses_app/backend/A_core_service/application/services/lectureAsset"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type LectureAssetsEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *LectureAssetsEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())
	canWrite := self.Services.Middleware.HasRole(entity.CoursePermissionsRoleWrite)
	canRead := self.Services.Middleware.HasRole(entity.CoursePermissionsRoleRead)

	r.Post("/:lectureId/files", canWrite, self.SetFilesToLecture)
	r.Get("/:lectureId/files", canRead, self.GetLectureFiles)
}

func (self *LectureAssetsEndpoints) SetFilesToLecture(ctx *fiber.Ctx) error {
	c := &SetFilesToLectureRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	

	fileIds := make([]entitycommon.Id, len(c.Body.FileIds))
	for i, id := range c.Body.FileIds {
		fileIds[i] = entitycommon.Id(id)
	}
	
	if err := self.Services.LectureAsset.SetFilesToLecture(
		lectureasset.SetFilesToLectureInput{
			LectureID: entitycommon.Id(c.Path.LectureId),
			FileIds:   fileIds,
		},
	); err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}

func (self *LectureAssetsEndpoints) GetLectureFiles(ctx *fiber.Ctx) error {
	c := &GetLectureFilesRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	output, err := self.Services.LectureAsset.GetLectureFiles(
		lectureasset.GetLectureFilesInput{
			LectureID: entitycommon.Id(c.Path.LectureId),
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(output.Assets))
}
