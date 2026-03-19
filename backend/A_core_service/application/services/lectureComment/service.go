package lecturecomment

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/gofiber/fiber/v2"
)

type LectureCommentService struct {
	Repo *infrastructure.AppRepositories
}

func (s *LectureCommentService) FindComments(input FindCommentsInput) ([]entity.LectureComment, error) {
	lecture := &entity.Lecture{Slug: entitycommon.Slug{Slug: input.LectureSlug}}
	if err := s.Repo.Lecture.FindOne(lecture, entity.LecturePreloadOptions{}); err != nil {
		return nil, err
	}

	comments, err := s.Repo.LectureComment.Find(
		&entity.LectureComment{LectureID: lecture.ID, ParentCommentID: input.ParentCommentID},
		entity.LectureCommentPreloadOptions{Author: true},
		input.Pagination,
		input.ParentCommentID == nil,
	)
	if err != nil {
		return nil, err
	}

	return comments, nil
}

func (s *LectureCommentService) CreateComment(input CreateCommentInput) (*entity.LectureComment, error) {
	lecture := &entity.Lecture{Slug: entitycommon.Slug{Slug: input.LectureSlug}}
	if err := s.Repo.Lecture.FindOne(lecture, entity.LecturePreloadOptions{CourseSection: true}); err != nil {
		return nil, err
	}
	if lecture.Kind == entity.LectureKindQuiz {
		return nil, &localerror.LocalError{Err: localerror.ErrKindForbidden, Status: fiber.StatusForbidden}
	}

	// If writing a reply, the parent comment must exist and must not be a reply itself.
	if input.ParentCommentID != nil {
		parent := &entity.LectureComment{Model: entitycommon.Model{ID: *input.ParentCommentID}}
		if err := s.Repo.LectureComment.FindOne(parent, entity.LectureCommentPreloadOptions{}); err != nil {
			return nil, err
		}
		if parent.ParentCommentID != nil {
			return nil, &localerror.LocalError{Err: localerror.ErrKindReplyOfReply, Status: fiber.StatusForbidden}
		}
	}

	authorIsStaff := true
	if err := s.Repo.CoursePermissions.FindOne(
		&entity.CoursePermissions{
			UserID:   input.AuthorID,
			CourseID: lecture.CourseSection.CourseID,
		},
		entity.CoursePermissionsPreloadOptions{},
	); err != nil {
		authorIsStaff = false
	}

	comment := &entity.LectureComment{
		AuthorID:        input.AuthorID,
		LectureID:       lecture.ID,
		ParentCommentID: input.ParentCommentID,
		Body:            input.Body,
		AuthorIsStaff:   authorIsStaff,
	}

	if err := s.Repo.LectureComment.Create(
		comment,
		entity.LectureCommentPreloadOptions{Author: true},
	); err != nil {
		return nil, err
	}

	return comment, nil
}

func (s *LectureCommentService) UpdateComment(input UpdateCommentInput) (*entity.LectureComment, error) {
	existing := &entity.LectureComment{Model: entitycommon.Model{ID: input.CommentID}}
	if err := s.Repo.LectureComment.FindOne(existing, entity.LectureCommentPreloadOptions{}); err != nil {
		return nil, err
	}

	if existing.AuthorID != input.AuthorID {
		return nil, &localerror.LocalError{Err: localerror.ErrKindForbidden, Status: fiber.StatusForbidden, Msg: "Not allowed to edit this comment"}
	}

	return s.Repo.LectureComment.Update(
		&entity.LectureComment{Model: entitycommon.Model{ID: input.CommentID}},
		&entity.LectureComment{Body: input.Body},
		entity.LectureCommentPreloadOptions{Author: true},
	)
}

func (s *LectureCommentService) DeleteComment(input DeleteCommentInput) error {
	comment := &entity.LectureComment{Model: entitycommon.Model{ID: input.CommentID}}
	if err := s.Repo.LectureComment.FindOne(
		comment,
		entity.LectureCommentPreloadOptions{Author: true},
	); err != nil {
		return err
	}

	if comment.AuthorID != input.AuthorID {
		return &localerror.LocalError{Err: localerror.ErrKindForbidden, Status: fiber.StatusForbidden}
	}

	return s.Repo.LectureComment.Delete(comment)
}
