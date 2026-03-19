package lecturecomments

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type LectureCommentResponse struct {
	Id              int64                        `json:"id"`
	CreatedAt       time.Time                    `json:"createdAt"`
	UpdatedAt       time.Time                    `json:"updatedAt"`
	Body            string                       `json:"body"`
	ReplyCount      int32                        `json:"replyCount"`
	ReplyFromStaff  bool                         `json:"replyFromStaff"`
	Author          LectureCommentAuthorResponse `json:"author"`
	ParentCommentID *int64                       `json:"parentCommentId"`
}

type LectureCommentAuthorResponse struct {
	IsStaff  bool    `json:"isStaff"`
	IsSelf   bool    `json:"isSelf"`
	Username string  `json:"username"`
	Avatar   *string `json:"avatar"`
}

func createCommentResponse(comment *entity.LectureComment, userJwtClaims *utils.ClientJwtClaims) *LectureCommentResponse {
	var avatar *string
	if comment.Author.Avatar != nil {
		path := comment.Author.Avatar.CdnImageUrl()
		avatar = &path
	}

	var parentId *int64
	if comment.ParentCommentID != nil {
		id := int64(*comment.ParentCommentID)
		parentId = &id
	}

	return &LectureCommentResponse{
		Id:             int64(comment.ID),
		CreatedAt:      comment.CreatedAt,
		UpdatedAt:      comment.UpdatedAt,
		Body:           comment.Body,
		ReplyCount:     comment.ReplyCount,
		ReplyFromStaff: comment.ReplyFromStaff,
		Author: LectureCommentAuthorResponse{
			Username: comment.Author.Username,
			Avatar:   avatar,
			IsSelf:   userJwtClaims != nil && int64(comment.AuthorID) == userJwtClaims.UserId,
			IsStaff:  comment.AuthorIsStaff,
		},
		ParentCommentID: parentId,
	}
}

func (self *ListCommentsRequest) getResponse(comments []entity.LectureComment, userJwtClaims *utils.ClientJwtClaims) []*LectureCommentResponse {
	responses := make([]*LectureCommentResponse, len(comments))
	for i, c := range comments {
		responses[i] = createCommentResponse(&c, userJwtClaims)
	}
	return responses
}

func (self *CreateCommentRequest) getResponse(comment *entity.LectureComment, userJwtClaims *utils.ClientJwtClaims) *LectureCommentResponse {
	return createCommentResponse(comment, userJwtClaims)
}

func (self *UpdateCommentRequest) getResponse(comment *entity.LectureComment, userJwtClaims *utils.ClientJwtClaims) *LectureCommentResponse {
	return createCommentResponse(comment, userJwtClaims)
}
