package lecture

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type LectureService struct {
	Repo *infrastructure.AppRepositories
}

// GetLectureCourseId returns the CourseId for a given LectureId for permission checking
func (s *LectureService) GetLectureCourseId(lectureId entitycommon.Id) (entitycommon.Id, error) {
	lecture := &entity.Lecture{Model: entitycommon.Model{ID: lectureId}}
	if err := s.Repo.Lecture.FindOne(lecture, entity.LecturePreloadOptions{CourseSection: true}); err != nil {
		return 0, global.Err(err)
	}
	return lecture.CourseSection.CourseID, nil
}

// GetCourseSectionCourseId returns the CourseId for a given CourseSectionId for permission checking
func (s *LectureService) GetCourseSectionCourseId(courseSectionId entitycommon.Id) (entitycommon.Id, error) {
	courseSection := &entity.CourseSection{Model: entitycommon.Model{ID: courseSectionId}}
	if err := s.Repo.CourseSection.FindOne(courseSection, entity.CourseSectionPreloadOptions{}); err != nil {
		return 0, global.Err(err)
	}
	return courseSection.CourseID, nil
}

func (s *LectureService) GetLecture(input GetLectureInput) (*GetLectureOutput, error) {
	lecture := &entity.Lecture{Model: entitycommon.Model{ID: input.LectureID}, Slug: input.LectureSlug}
	preload := entity.LecturePreloadOptions{
		CourseSection: true,
		Assets:        true,
		LectureAssetPreloadOptions: entity.LectureAssetPreloadOptions{
			File: true,
		},
	}

	if err := s.Repo.Lecture.FindOne(lecture, preload); err != nil {
		return nil, global.Err(err)
	}

	if input.UserId != nil {
		coursePurchase := &entity.CoursePurchase{CourseID: lecture.CourseSection.CourseID, UserID: *input.UserId}
		if err := s.Repo.CoursePurchase.FindOne(coursePurchase, entity.CoursePurchasePreloadOptions{}); err != nil {
			return nil, &localerror.LocalError{Err: localerror.ErrKindForbidden, Status: fiber.StatusForbidden}
		}
	}

	lectureData, lectureExtraData, err := s.getLectureKind(lecture, input.UserId)
	if err != nil {
		return nil, global.Err(err)
	}
	return &GetLectureOutput{
		Lecture:          lecture,
		LectureData:      lectureData,
		LectureExtraData: lectureExtraData,
		CourseSection:    lecture.CourseSection,
	}, nil
}

// CreateLecture creates a new lecture with its associated data
func (s *LectureService) CreateLecture(input CreateLectureInput) (*CreateLectureOutput, error) {
	courseSection := &entity.CourseSection{Model: entitycommon.Model{ID: input.CourseSectionID}}
	courseSectionPreload := entity.CourseSectionPreloadOptions{Lectures: true}
	if err := s.Repo.CourseSection.FindOne(courseSection, courseSectionPreload); err != nil {
		return nil, global.Err(err)
	}

	lecture := &entity.Lecture{
		Title:           input.Title,
		Description:     input.Description,
		Visibility:      input.Visibility,
		Position:        len(courseSection.Lectures) + 1,
		CourseSectionID: courseSection.ID,
	}

	lectureData, err := s.createLectureKind(input.LectureKind, input.LectureDataBody, lecture)
	if err != nil {
		return nil, global.Err(err)
	}

	if err := s.Repo.Lecture.Create(lecture, entity.LecturePreloadOptions{}); err != nil {
		return nil, global.Err(err)
	}

	return &CreateLectureOutput{
		Lecture:       lecture,
		LectureData:   lectureData,
		CourseSection: courseSection,
	}, nil
}

// UpdateLecture updates an existing lecture
func (s *LectureService) UpdateLecture(input UpdateLectureInput) (*UpdateLectureOutput, error) {
	lecture := &entity.Lecture{Model: entitycommon.Model{ID: input.LectureID}}
	preload := entity.LecturePreloadOptions{}
	if err := s.Repo.Lecture.FindOne(lecture, preload); err != nil {
		return nil, global.Err(err)
	}

	if input.Title != nil {
		lecture.Title = *input.Title
	}
	if input.Description != nil {
		lecture.Description = *input.Description
	}
	if input.Visibility != nil {
		lecture.Visibility = *input.Visibility
	}

	var lectureData any = nil

	if input.LectureKind != nil && input.LectureDataBody != nil {
		newLecture := &entity.Lecture{
			Title:           lecture.Title,
			Description:     lecture.Description,
			Visibility:      lecture.Visibility,
			CourseSectionID: lecture.CourseSectionID,
			Position:        lecture.Position,
		}

		lectureDataInner, err := s.createLectureKind(*input.LectureKind, input.LectureDataBody, newLecture)
		if err != nil {
			return nil, global.Err(err)
		}
		lectureData = lectureDataInner

		if err := s.Repo.Lecture.Create(newLecture, entity.LecturePreloadOptions{}); err != nil {
			return nil, global.Err(err)
		}
		if err := s.Repo.Lecture.Delete(&entity.Lecture{Model: entitycommon.Model{ID: lecture.ID}}); err != nil {
			return nil, global.Err(err)
		}

		*lecture = *newLecture
	} else {
		// Update lecture
		updateBy := &entity.Lecture{Model: entitycommon.Model{ID: lecture.ID}}
		if _, err := s.Repo.Lecture.Update(updateBy, lecture); err != nil {
			return nil, global.Err(err)
		}
	}

	// Fetch the lecture data
	if lectureData == nil {
		lectureDataInner, _, err := s.getLectureKind(lecture, nil)
		lectureData = lectureDataInner
		if err != nil {
			return nil, global.Err(err)
		}
	}

	return &UpdateLectureOutput{
		Lecture:     lecture,
		LectureData: lectureData,
	}, nil
}

// DeleteLecture deletes a lecture and its associated data
func (s *LectureService) DeleteLecture(input DeleteLectureInput) error {
	lecture := &entity.Lecture{Model: entitycommon.Model{ID: input.LectureID}}
	preload := entity.LecturePreloadOptions{Assets: true}

	if err := s.Repo.Lecture.FindOne(lecture, preload); err != nil {
		return global.Err(err)
	}

	if err := s.Repo.Lecture.Delete(lecture); err != nil {
		return global.Err(err)
	}

	return nil
}

// UpdateLecturePosition updates the position of a lecture within a section
func (s *LectureService) UpdateLecturePosition(input UpdateLecturePositionInput) error {
	courseSection := &entity.CourseSection{Model: entitycommon.Model{ID: input.CourseSectionID}}
	courseSectionPreload := entity.CourseSectionPreloadOptions{Lectures: true}
	if err := s.Repo.CourseSection.FindOne(courseSection, courseSectionPreload); err != nil {
		return global.Err(err)
	}

	lectures := courseSection.Lectures

	// Find current lecture and its old position
	oldPosition := -1
	for _, lecture := range lectures {
		if lecture.ID == input.LectureID {
			oldPosition = lecture.Position
			break
		}
	}
	if oldPosition == -1 {
		return &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}
	if oldPosition == input.NewPosition {
		return nil
	}

	// Adjust positions
	if oldPosition < input.NewPosition {
		// moving position down
		for i := range lectures {
			if lectures[i].Position > oldPosition && lectures[i].Position <= input.NewPosition {
				lectures[i].Position--
			}
		}
	} else {
		// moving position up
		for i := range lectures {
			if lectures[i].Position >= input.NewPosition && lectures[i].Position < oldPosition {
				lectures[i].Position++
			}
		}
	}

	// Update the target lecture
	newPositions := make([]utils.Positions, len(lectures))
	for i, lecture := range lectures {
		if lecture.ID == input.LectureID {
			newPositions[i] = utils.Positions{ID: int64(lecture.ID), Position: input.NewPosition}
		} else {
			newPositions[i] = utils.Positions{ID: int64(lecture.ID), Position: lecture.Position}
		}
	}

	// Save all updated lectures
	if err := s.Repo.Lecture.UpdatePositions(newPositions); err != nil {
		return global.Err(err)
	}

	return nil
}

// MoveLectureToSection moves a lecture to a different section
func (s *LectureService) MoveLectureToSection(input MoveLectureToSectionInput) error {
	// Find the lecture with its current section
	lecture := &entity.Lecture{Model: entitycommon.Model{ID: input.LectureID}}
	if err := s.Repo.Lecture.FindOne(lecture, entity.LecturePreloadOptions{}); err != nil {
		return global.Err(err)
	}

	oldCourseSectionId := lecture.CourseSectionID

	// If same section, no need to move
	if oldCourseSectionId == input.NewCourseSectionID {
		return nil
	}

	// Get old section with all lectures to adjust positions
	oldSection := &entity.CourseSection{Model: entitycommon.Model{ID: oldCourseSectionId}}
	oldSectionPreload := entity.CourseSectionPreloadOptions{Lectures: true}
	if err := s.Repo.CourseSection.FindOne(oldSection, oldSectionPreload); err != nil {
		return global.Err(err)
	}

	// Get new section with all lectures to get the new position
	newSection := &entity.CourseSection{Model: entitycommon.Model{ID: input.NewCourseSectionID}}
	newSectionPreload := entity.CourseSectionPreloadOptions{Lectures: true}
	if err := s.Repo.CourseSection.FindOne(newSection, newSectionPreload); err != nil {
		return global.Err(err)
	}

	// Update lecture's section and position (add to end of new section)
	lectureUpdate := &entity.Lecture{
		CourseSectionID: input.NewCourseSectionID,
		Position:        len(newSection.Lectures) + 1,
	}
	if _, err := s.Repo.Lecture.Update(lecture, lectureUpdate); err != nil {
		return global.Err(err)
	}

	// Adjust positions in old section (close the gap)
	oldPositions := make([]utils.Positions, 0)
	for _, l := range oldSection.Lectures {
		if l.ID != lecture.ID && l.Position > lecture.Position {
			oldPositions = append(oldPositions, utils.Positions{
				ID:       int64(l.ID),
				Position: l.Position - 1,
			})
		}
	}

	if len(oldPositions) > 0 {
		if err := s.Repo.Lecture.UpdatePositions(oldPositions); err != nil {
			return global.Err(err)
		}
	}

	return nil
}

// getLectureKind retrieves the specific lecture data based on its kind
func (s *LectureService) getLectureKind(lecture *entity.Lecture, userId *entitycommon.Id) (any, any, error) {
	switch lecture.Kind {
	case entity.LectureKindVideo:
		lectureVideo := &entity.LectureVideo{Model: entitycommon.Model{ID: lecture.Data}}
		lectureVideoPreload := entity.LectureVideoPreloadOptions{File: true}
		err := s.Repo.LectureVideo.FindOne(lectureVideo, lectureVideoPreload)
		return lectureVideo, nil, global.Err(err)

	case entity.LectureKindDocument:
		lectureDocument := &entity.LectureDocument{Model: entitycommon.Model{ID: lecture.Data}}
		lectureDocumentPreload := entity.LectureDocumentPreloadOptions{}
		err := s.Repo.LectureDocument.FindOne(lectureDocument, lectureDocumentPreload)
		return lectureDocument, nil, global.Err(err)

	case entity.LectureKindQuiz:
		lectureQuiz := &entity.LectureQuiz{Model: entitycommon.Model{ID: lecture.Data}}
		lectureQuizPreload := entity.LectureQuizPreloadOptions{}
		err := s.Repo.LectureQuiz.FindOne(lectureQuiz, lectureQuizPreload)

		if err != nil {
			return nil, nil, global.Err(err)
		}

		if userId != nil {
			lastAttempt, err := s.Repo.QuizAttempt.FindLast(*userId, lecture.ID, entity.QuizAttemptPreloadOptions{})
			if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, nil, global.Err(err)
			}
			return lectureQuiz, lastAttempt, nil
		}
		return lectureQuiz, nil, global.Err(err)

	case entity.LectureKindLab:
		return nil, nil, fmt.Errorf("unimplemented")
	}

	return nil, nil, fmt.Errorf("unreachable")
}

// createLectureKind creates the specific lecture data based on its kind
func (s *LectureService) createLectureKind(lectureKind entity.LectureKind, data any, lecture *entity.Lecture) (any, error) {
	switch lectureKind {
	case entity.LectureKindVideo:
		lectureVideoBody := data.(CreateLectureDataKindVideo)

		// check if READY
		file := &entity.File{Model: entitycommon.Model{ID: entitycommon.Id(lectureVideoBody.FileId)}}
		if err := s.Repo.File.FindOne(file, entity.FilePreloadOptions{}); err != nil {
			return nil, global.Err(err)
		}
		if file.Status != entity.FileStatusReady {
			return nil, &localerror.LocalError{Err: localerror.ErrKindVideoNotReady, Status: fiber.StatusBadRequest}
		}

		// create lectureKind
		lectureVideoEntity := &entity.LectureVideo{FileID: entitycommon.Id(lectureVideoBody.FileId)}
		lectureVideoPreload := entity.LectureVideoPreloadOptions{File: true}
		if err := s.Repo.LectureVideo.Create(lectureVideoEntity, lectureVideoPreload); err != nil {
			return nil, global.Err(err)
		}

		// assign to lecture
		var metadata entity.FileMetadataKindVideo
		if err := json.Unmarshal(lectureVideoEntity.File.Metadata, &metadata); err != nil {
			return nil, global.Err(err)
		}
		lecture.EstimatedDurationSecs = int32(metadata.Duration)
		lecture.Data = lectureVideoEntity.ID
		lecture.Kind = lectureKind

		return lectureVideoEntity, nil

	case entity.LectureKindDocument:
		lectureDocumentBody := data.(CreateLectureDataKindDocument)

		lectureDocumentEntity := &entity.LectureDocument{Body: datatypes.JSON(lectureDocumentBody.Body)}
		lectureDocumentPreload := entity.LectureDocumentPreloadOptions{}
		if err := s.Repo.LectureDocument.Create(lectureDocumentEntity, lectureDocumentPreload); err != nil {
			return nil, global.Err(err)
		}

		lecture.EstimatedDurationSecs = 0 //TODO
		lecture.Data = lectureDocumentEntity.ID
		lecture.Kind = lectureKind

		return lectureDocumentEntity, nil
	case entity.LectureKindQuiz:
		lectureQuizBody := data.(CreateLectureDataKindQuiz)

		quiz := &entity.LectureQuiz{Model: entitycommon.Model{ID: entitycommon.Id(lectureQuizBody.QuizId)}}
		if err := s.Repo.LectureQuiz.FindOne(quiz, entity.LectureQuizPreloadOptions{}); err != nil {
			return nil, global.Err(err)
		}

		lecture.EstimatedDurationSecs = 0 //TODO
		lecture.Data = quiz.ID
		lecture.Kind = lectureKind

		return quiz, nil
	case entity.LectureKindLab:
		return nil, fmt.Errorf("unimplemented")
	}

	return nil, fmt.Errorf("unreachable")
}

// deleteLectureKind deletes the specific lecture data based on its kind
func (s *LectureService) deleteLectureKind(lectureKind entity.LectureKind, data entitycommon.Id) error {
	switch lectureKind {
	case entity.LectureKindVideo:
		return s.Repo.LectureVideo.Delete(&entity.LectureVideo{Model: entitycommon.Model{ID: data}})
	case entity.LectureKindDocument:
		return s.Repo.LectureDocument.Delete(&entity.LectureDocument{Model: entitycommon.Model{ID: data}})
	case entity.LectureKindLab:
		return nil
	case entity.LectureKindQuiz:
		return fmt.Errorf("unimplemented")
	}

	return fmt.Errorf("unreachable")
}

func (s *LectureService) updateLectureKind(lectureKind entity.LectureKind, data any, lecture *entity.Lecture) (any, error) {
	switch lectureKind {
	case entity.LectureKindVideo:
		lectureVideoBody := data.(CreateLectureDataKindVideo)

		// check if READY
		file := &entity.File{Model: entitycommon.Model{ID: entitycommon.Id(lectureVideoBody.FileId)}}
		if err := s.Repo.File.FindOne(file, entity.FilePreloadOptions{}); err != nil {
			return nil, global.Err(err)
		}
		if file.Status != entity.FileStatusReady {
			return nil, &localerror.LocalError{Err: localerror.ErrKindVideoNotReady, Status: fiber.StatusBadRequest}
		}

		// update lectureKind
		lectureVideoEntity := &entity.LectureVideo{FileID: entitycommon.Id(lectureVideoBody.FileId)}
		if err := s.Repo.LectureVideo.UpdateOne(
			&entity.LectureVideo{Model: entitycommon.Model{ID: lecture.Data}},
			lectureVideoEntity,
		); err != nil {
			return nil, global.Err(err)
		}
		lectureVideoEntity.File = file

		// assign to lecture
		var metadata entity.FileMetadataKindVideo
		if err := json.Unmarshal(lectureVideoEntity.File.Metadata, &metadata); err != nil {
			return nil, global.Err(err)
		}
		lecture.EstimatedDurationSecs = int32(metadata.Duration)
		lecture.Data = lectureVideoEntity.ID
		lecture.Kind = lectureKind

		return lectureVideoEntity, nil

	case entity.LectureKindDocument:
		lectureDocumentBody := data.(CreateLectureDataKindDocument)

		// update lectureKind
		lectureDocumentEntity := &entity.LectureDocument{Body: datatypes.JSON(lectureDocumentBody.Body)}
		if err := s.Repo.LectureDocument.UpdateOne(
			&entity.LectureDocument{Model: entitycommon.Model{ID: lecture.Data}},
			lectureDocumentEntity,
		); err != nil {
			return nil, global.Err(err)
		}

		// assign to lecture
		lecture.EstimatedDurationSecs = 0 //TODO
		lecture.Data = lectureDocumentEntity.ID
		lecture.Kind = lectureKind

		return lectureDocumentEntity, nil

	case entity.LectureKindQuiz:
		lectureQuizBody := data.(CreateLectureDataKindQuiz)

		quiz := &entity.LectureQuiz{Model: entitycommon.Model{ID: entitycommon.Id(lectureQuizBody.QuizId)}}
		if err := s.Repo.LectureQuiz.FindOne(quiz, entity.LectureQuizPreloadOptions{}); err != nil {
			return nil, global.Err(err)
		}

		lecture.EstimatedDurationSecs = 0 //TODO
		lecture.Data = quiz.ID
		lecture.Kind = lectureKind

		return quiz, nil

	case entity.LectureKindLab:
		return nil, fmt.Errorf("unimplemented")
	}

	return nil, fmt.Errorf("unreachable")
}
