package lectures

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/lecture"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type LecturesEndpoints struct {
	Services *services.AppServices
	Utils    *utils.AppUtils
}

func (self *LecturesEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.Services.Middleware.ClientAuth())
	canWrite := self.Services.Middleware.HasRole(entity.CoursePermissionsRoleWrite)
	canRead := self.Services.Middleware.HasRole(entity.CoursePermissionsRoleWrite)

	r.Post("/create", canWrite, self.CreateLecture)
	r.Get("/:lectureId", canRead, self.GetLecture)
	r.Put("/:lectureId", canWrite, self.UpdateLecture)
	r.Delete("/:lectureId", canWrite, self.DeleteLecture)
	r.Put("/:lectureId/position", canWrite, self.UpdateLecturePosition)
	r.Put("/:lectureId/section", canWrite, self.MoveLectureToSection)
}

func (self *LecturesEndpoints) GetLecture(ctx *fiber.Ctx) error {
	c := &GetLectureRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	resp, err := self.Services.Lecture.GetLecture(
		lecture.GetLectureInput{
			LectureID: entitycommon.Id(c.LectureId),
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(
		resp.Lecture,
		resp.LectureData,
		resp.CourseSection,
	))
}

func (self *LecturesEndpoints) CreateLecture(ctx *fiber.Ctx) error {
	c := CreateLectureRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	lectureDataBody, err := c.getLectureData()
	if err != nil {
		return err
	}

	visibility := entity.LectureVisibilityPrivate
	if c.Body.Visibility != nil {
		visibility = *c.Body.Visibility
	}

	resp, err := self.Services.Lecture.CreateLecture(
		lecture.CreateLectureInput{
			Title:           c.Body.Title,
			Description:     c.Body.Description,
			Visibility:      visibility,
			CourseSectionID: entitycommon.Id(c.Body.CourseSectionId),
			LectureKind:     c.Body.LectureKind,
			LectureDataBody: lectureDataBody,
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(201).JSON(c.getResponse(
		resp.Lecture,
		resp.LectureData,
		resp.CourseSection,
	))
}

func (self *LecturesEndpoints) UpdateLecture(ctx *fiber.Ctx) error {
	c := &UpdateLectureRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	var lectureDataBody any = nil
	if c.Body.LectureKind != nil && c.Body.LectureData != nil {
		data, err := c.getLectureData()
		if err != nil {
			return err
		}
		lectureDataBody = data
	}

	resp, err := self.Services.Lecture.UpdateLecture(
		lecture.UpdateLectureInput{
			LectureID:       entitycommon.Id(c.Params.LectureId),
			Title:           c.Body.Title,
			Description:     c.Body.Description,
			Visibility:      c.Body.Visibility,
			LectureKind:     c.Body.LectureKind,
			LectureDataBody: lectureDataBody,
		},
	)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(
		resp.Lecture,
		resp.LectureData,
		&resp.Lecture.CourseSection,
	))
}

func (self *LecturesEndpoints) DeleteLecture(ctx *fiber.Ctx) error {
	c := &DeleteLectureRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	err := self.Services.Lecture.DeleteLecture(
		lecture.DeleteLectureInput{
			LectureID: entitycommon.Id(c.LectureId),
		},
	)
	if err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}

func (self *LecturesEndpoints) UpdateLecturePosition(ctx *fiber.Ctx) error {
	c := &UpdateLecturePositionRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	err := self.Services.Lecture.UpdateLecturePosition(
		lecture.UpdateLecturePositionInput{
			LectureID:       entitycommon.Id(c.Params.LectureId),
			CourseSectionID: entitycommon.Id(c.Body.CourseSectionId),
			NewPosition:     c.Body.Position,
		},
	)
	if err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}

func (self *LecturesEndpoints) MoveLectureToSection(ctx *fiber.Ctx) error {
	c := &MoveLectureToSectionRequest{}
	if err := c.bind(self.Utils, ctx); err != nil {
		return err
	}

	err := self.Services.Lecture.MoveLectureToSection(
		lecture.MoveLectureToSectionInput{
			LectureID:          entitycommon.Id(c.Params.LectureId),
			NewCourseSectionID: entitycommon.Id(c.Body.NewCourseSectionId),
		},
	)
	if err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}
