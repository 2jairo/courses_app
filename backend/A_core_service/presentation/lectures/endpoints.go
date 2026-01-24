package lectures

import (
	"fmt"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type LecturesEndpoints struct {
	State *state.AppState
}

func (self *LecturesEndpoints) RegisterRoutes(r fiber.Router) {
	r.Use(self.State.AuthMiddleware.ClientAuth())
	canWrite := self.State.CourseRoleMiddleware.HasRole(entity.CoursePermissionsRoleWrite)
	canRead := self.State.CourseRoleMiddleware.HasRole(entity.CoursePermissionsRoleWrite)

	r.Post("/create", canWrite, self.CreateLecture)
	r.Get("/:lectureId", canRead, self.GetLecture)
	r.Put("/:lectureId", canWrite, self.UpdateLecture)
	r.Delete("/:lectureId", canWrite, self.DeleteLecture)
	r.Put("/:lectureId/position", canWrite, self.UpdateLecturePosition)
	r.Put("/:lectureId/section", canWrite, self.MoveLectureToSection)
}

func (self *LecturesEndpoints) GetLecture(ctx *fiber.Ctx) error {
	c := &GetLectureRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	lecture := &entity.Lecture{Model: entitycommon.Model{ID: c.LectureId}}
	preload := entity.LecturePreloadOptions{CourseSection: true}

	if err := self.State.LectureRepository.FindOne(lecture, preload); err != nil {
		return err
	}

	// Fetch the lecture data based on kind
	lectureData, err := self.getLectureKind(lecture)
	if err != nil {
		return err
	}

	return ctx.Status(200).JSON(c.getResponse(lecture, lectureData, &lecture.CourseSection))
}

func (self *LecturesEndpoints) CreateLecture(ctx *fiber.Ctx) error {
	c := CreateLectureRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	courseSection := &entity.CourseSection{Model: entitycommon.Model{ID: c.Body.CourseSectionId}}
	courseSectionPreload := entity.CourseSectionPreloadOptions{Lectures: true}
	if err := self.State.CourseSectionRepository.FindOne(courseSection, courseSectionPreload); err != nil {
		return err
	}

	lectureDataBody, err := c.getLectureData()
	if err != nil {
		return err
	}

	lectureDataId, lectureData, err := self.createLectureKind(c.Body.LectureKind, lectureDataBody)
	if err != nil {
		return err
	}

	lecture := &entity.Lecture{
		Title:           c.Body.Title,
		Description:     c.Body.Description,
		Visibility:      *c.Body.Visibility,
		Position:        len(courseSection.Lectures) + 1,
		CourseSectionID: courseSection.ID,
		Kind:            c.Body.LectureKind,
		Data:            lectureDataId,
	}
	if c.Body.Visibility == nil {
		lecture.Visibility = entity.LectureVisibilityPrivate
	}

	if err := self.State.LectureRepository.Create(lecture, entity.LecturePreloadOptions{}); err != nil {
		return err
	}

	return ctx.Status(201).JSON(c.getResponse(lecture, lectureData, courseSection))
}

func (self *LecturesEndpoints) UpdateLecture(ctx *fiber.Ctx) error {
	c := &UpdateLectureRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	lecture := &entity.Lecture{Model: entitycommon.Model{ID: c.Params.LectureId}}
	preload := entity.LecturePreloadOptions{}
	if err := self.State.LectureRepository.FindOne(lecture, preload); err != nil {
		return err
	}

	var lectureData any = nil

	// Update lecture kind data if provided
	if c.Body.LectureKind != nil && c.Body.LectureData != nil {
		lectureDataBody, err := c.getLectureData()
		if err != nil {
			return err
		}

		lectureDataId, lectureDataInner, err := self.createLectureKind(*c.Body.LectureKind, lectureDataBody)
		if err != nil {
			return err
		}

		if err := self.deleteLectureKind(lecture.Kind, lecture.Data); err != nil {
			return err
		}

		lectureData = lectureDataInner
		lecture.Data = lectureDataId
		lecture.Kind = *c.Body.LectureKind
	}

	// Update fields
	if c.Body.Title != nil {
		lecture.Title = *c.Body.Title
	}
	if c.Body.Description != nil {
		lecture.Description = *c.Body.Description
	}
	if c.Body.Visibility != nil {
		lecture.Visibility = *c.Body.Visibility
	}

	// Update lecture
	updateBy := &entity.Lecture{Model: entitycommon.Model{ID: c.Params.LectureId}}
	if _, err := self.State.LectureRepository.Update(updateBy, lecture); err != nil {
		return err
	}

	// Fetch the lecture data
	if lectureData == nil {
		lectureDataInner, err := self.getLectureKind(lecture)
		lectureData = lectureDataInner
		if err != nil {
			return err
		}
	}

	return ctx.Status(200).JSON(c.getResponse(lecture, lectureData, &lecture.CourseSection))
}

func (self *LecturesEndpoints) getLectureKind(lecture *entity.Lecture) (any, error) {
	// switchLectureKind
	switch lecture.Kind {
	case entity.LectureKindVideo:
		lectureVideo := &entity.LectureVideo{Model: entitycommon.Model{ID: lecture.Data}}
		lectureVideoPreload := entity.LectureVideoPreloadOptions{File: true}
		err := self.State.LectureVideoRepository.FindOne(lectureVideo, lectureVideoPreload)
		return lectureVideo, err

	case entity.LectureKindDocument:
		lectureDocument := &entity.LectureDocument{Model: entitycommon.Model{ID: lecture.Data}}
		lectureDocumentPreload := entity.LectureDocumentPreloadOptions{}
		err := self.State.LectureDocumentRepository.FindOne(lectureDocument, lectureDocumentPreload)
		return lectureDocument, err

	case entity.LectureKindQuiz:
		return nil, fmt.Errorf("unimplemented")

	case entity.LectureKindLab:
		return nil, fmt.Errorf("unimplemented")
	}

	return nil, fmt.Errorf("Unreachable")
}

func (self *LecturesEndpoints) createLectureKind(lectureKind entity.LectureKind, data any) (int64, any, error) {
	switch lectureKind {
	case entity.LectureKindVideo:
		lectureVideoBody := data.(CreateLectureRequestKindVideo)

		lectureVideoEntity := &entity.LectureVideo{FileID: lectureVideoBody.FileId}
		lectureVideoPreload := entity.LectureVideoPreloadOptions{File: true}
		if err := self.State.LectureVideoRepository.Create(lectureVideoEntity, lectureVideoPreload); err != nil {
			return 0, nil, err
		}
		return lectureVideoEntity.ID, lectureVideoEntity, nil
	case entity.LectureKindDocument:
		lectureDocumentBody := data.(CreateLectureRequestKindDocument)

		lectureDocumentEntity := &entity.LectureDocument{Body: lectureDocumentBody.Body}
		lectureDocumentPreload := entity.LectureDocumentPreloadOptions{}
		if err := self.State.LectureDocumentRepository.Create(lectureDocumentEntity, lectureDocumentPreload); err != nil {
			return 0, nil, err
		}

		return lectureDocumentEntity.ID, lectureDocumentEntity, nil
	case entity.LectureKindLab:
		return 0, nil, fmt.Errorf("unimplemented")
	case entity.LectureKindQuiz:
		return 0, nil, fmt.Errorf("unimplemented")
	}

	return 0, nil, fmt.Errorf("Unreachable")
}

func (self *LecturesEndpoints) deleteLectureKind(lectureKind entity.LectureKind, data int64) error {
	switch lectureKind {
	case entity.LectureKindVideo:
		return self.State.LectureVideoRepository.Delete(&entity.LectureVideo{Model: entitycommon.Model{ID: data}})
	case entity.LectureKindDocument:
		return self.State.LectureDocumentRepository.Delete(&entity.LectureDocument{Model: entitycommon.Model{ID: data}})
	case entity.LectureKindLab:
		return fmt.Errorf("unimplemented")
	case entity.LectureKindQuiz:
		return fmt.Errorf("unimplemented")
	}

	return fmt.Errorf("Unreachable")
}

func (self *LecturesEndpoints) DeleteLecture(ctx *fiber.Ctx) error {
	c := &DeleteLectureRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	lecture := &entity.Lecture{Model: entitycommon.Model{ID: c.LectureId}}
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

func (self *LecturesEndpoints) UpdateLecturePosition(ctx *fiber.Ctx) error {
	c := &UpdateLecturePositionRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	courseSection := &entity.CourseSection{Model: entitycommon.Model{ID: c.Body.CourseSectionId}}
	courseSectionPreload := entity.CourseSectionPreloadOptions{Lectures: true}
	if err := self.State.CourseSectionRepository.FindOne(courseSection, courseSectionPreload); err != nil {
		return err
	}

	lectures := courseSection.Lectures

	// Find current lecture and its old position
	oldPosition := -1
	for _, l := range lectures {
		if l.ID == c.Params.LectureId {
			oldPosition = l.Position
			break
		}
	}
	if oldPosition == -1 {
		return &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}
	if oldPosition == c.Body.Position {
		ctx.Status(fiber.StatusOK)
		return nil
	}

	newPos := c.Body.Position
	if oldPosition < newPos {
		// moving position down
		for i := range lectures {
			if lectures[i].Position > oldPosition && lectures[i].Position <= newPos {
				lectures[i].Position--
			}
		}
	} else {
		// moving position up
		for i := range lectures {
			if lectures[i].Position >= newPos && lectures[i].Position < oldPosition {
				lectures[i].Position++
			}
		}
	}

	// Update the target lecture
	newPositions := make([]utils.Positions, len(lectures))
	for i, l := range lectures {
		if l.ID == c.Params.LectureId {
			newPositions[i] = utils.Positions{ID: l.ID, Position: newPos}
		} else {
			newPositions[i] = utils.Positions{ID: l.ID, Position: l.Position}
		}
	}

	// Save all updated lectures
	if err := self.State.LectureRepository.UpdatePositions(newPositions); err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}

func (self *LecturesEndpoints) MoveLectureToSection(ctx *fiber.Ctx) error {
	c := &MoveLectureToSectionRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	// Find the lecture with its current section
	lecture := &entity.Lecture{Model: entitycommon.Model{ID: c.Params.LectureId}}
	if err := self.State.LectureRepository.FindOne(lecture, entity.LecturePreloadOptions{}); err != nil {
		return err
	}

	oldCourseSectionId := lecture.CourseSectionID

	// If same section, no need to move
	if oldCourseSectionId == c.Body.NewCourseSectionId {
		ctx.Status(fiber.StatusOK)
		return nil
	}

	// Get old section with all lectures to adjust positions
	oldSection := &entity.CourseSection{Model: entitycommon.Model{ID: oldCourseSectionId}}
	oldSectionPreload := entity.CourseSectionPreloadOptions{Lectures: true}
	if err := self.State.CourseSectionRepository.FindOne(oldSection, oldSectionPreload); err != nil {
		return err
	}

	// Get new section with all lectures to get the new position
	newSection := &entity.CourseSection{Model: entitycommon.Model{ID: c.Body.NewCourseSectionId}}
	newSectionPreload := entity.CourseSectionPreloadOptions{Lectures: true}
	if err := self.State.CourseSectionRepository.FindOne(newSection, newSectionPreload); err != nil {
		return err
	}

	// Update lecture's section and position (add to end of new section)
	lectureUpdate := &entity.Lecture{
		CourseSectionID: c.Body.NewCourseSectionId,
		Position:        len(newSection.Lectures) + 1,
	}
	if _, err := self.State.LectureRepository.Update(lecture, lectureUpdate); err != nil {
		return err
	}

	// Adjust positions in old section (close the gap)
	oldPositions := make([]utils.Positions, 0)
	for _, l := range oldSection.Lectures {
		if l.ID != lecture.ID && l.Position > lecture.Position {
			oldPositions = append(oldPositions, utils.Positions{
				ID:       l.ID,
				Position: l.Position - 1,
			})
		}
	}

	if len(oldPositions) > 0 {
		if err := self.State.LectureRepository.UpdatePositions(oldPositions); err != nil {
			return err
		}
	}

	ctx.Status(fiber.StatusOK)
	return nil
}
