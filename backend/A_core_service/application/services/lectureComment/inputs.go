package lecturecomment

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type FindCommentsInput struct {
	LectureSlug     string
	ParentCommentID *entitycommon.Id
	Pagination      *utils.Pagination
}

type CreateCommentInput struct {
	AuthorID        entitycommon.Id
	LectureSlug     string
	ParentCommentID *entitycommon.Id
	Body            string
}

type UpdateCommentInput struct {
	AuthorID  entitycommon.Id
	CommentID entitycommon.Id
	Body      string
}

type DeleteCommentInput struct {
	AuthorID  entitycommon.Id
	CommentID entitycommon.Id
}
