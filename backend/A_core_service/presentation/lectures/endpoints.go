package lectures

import (
	"fmt"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/gofiber/fiber/v2"
)

type LecturesEndpoints struct {
	State *state.AppState
}

func (self *LecturesEndpoints) RegisterRoutes(r fiber.Router) {
	r.Post("/create", self.State.AuthMiddleware.ClientAuth(), self.CreateLecture)
	r.Delete("/:lectureSlug", self.State.AuthMiddleware.ClientAuth(), self.DeleteLecture)
}

func (self *LecturesEndpoints) CreateLecture(ctx *fiber.Ctx) error {
	c := CreateLectureRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	courseSection := &entity.CourseSection{Slug: entity.Slug{Slug: c.CourseSectionSlug}}
	courseSectionPreload := entity.CourseSectionPreloadOptions{Lectures: true}
	if err := self.State.CourseSectionRepository.FindOne(courseSection, courseSectionPreload); err != nil {
		return err
	}

	lectureDataId, lectureData, err := self.createLectureKind(&c)
	if err != nil {
		return err
	}

	lecture := &entity.Lecture{
		Title:           c.Title,
		Description:     c.Description,
		Visibility:      *c.Visibility,
		Position:        len(courseSection.Lectures) + 1,
		CourseSectionID: courseSection.ID,
		Kind:            c.LectureKind,
		Data:            lectureDataId,
	}
	if c.Visibility == nil {
		lecture.Visibility = entity.LectureVisibilityPrivate
	}

	if err := self.State.LectureRepository.Create(lecture, entity.LecturePreloadOptions{}); err != nil {
		return err
	}

	return ctx.Status(201).JSON(c.getResponse(lecture, lectureData, courseSection))
}

func (self *LecturesEndpoints) createLectureKind(c *CreateLectureRequest) (int64, any, error) {
	data, err := c.getLectureData()
	if err != nil {
		return 0, nil, err
	}

	switch c.LectureKind {
	case entity.LectureKindVideo:
		lectureVideoBody := data.(CreateLectureRequestKindVideo)

		lectureVideoEntity := &entity.LectureVideo{FileID: lectureVideoBody.FileId}
		lectureVideoPreload := entity.LectureVideoPreloadOptions{File: true}
		if err := self.State.LectureVideoRepository.Create(lectureVideoEntity, lectureVideoPreload); err != nil {
			return 0, nil, err
		}
		return lectureVideoEntity.ID, lectureVideoEntity, nil
	case entity.LectureKindDocument:
		// lectureDocumentBody := data.(CreateLectureRequestKindDocument)
		return 0, nil, fmt.Errorf("unimplemented")
	}

	return 0, nil, nil
}

func (self *LecturesEndpoints) DeleteLecture(ctx *fiber.Ctx) error {
	c := &DeleteLectureRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	lecture := &entity.Lecture{Slug: entity.Slug{Slug: c.LectureSlug}}
	preload := entity.LecturePreloadOptions{Assets: true}

	if err := self.State.LectureRepository.FindOne(lecture, preload); err != nil {
		return err
	}

	if err := self.State.LectureRepository.Delete(lecture); err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}
