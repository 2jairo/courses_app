package coursereviews

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type ReviewResponse struct {
	ID      int64                `json:"id"`
	Rating  int32                `json:"rating"`
	Comment string               `json:"comment"`
	Author  ReviewAuthorResponse `json:"author"`
}
type ReviewAuthorResponse struct {
	Username string  `json:"username"`
	Avatar   *string `json:"avatar"`
	IsSelf   bool    `json:"isSelf"`
}

func buildResponse(review *entity.CourseReview, userJwtClaims *utils.ClientJwtClaims) *ReviewResponse {
	var avatar *string = nil
	if review.User.Avatar != nil {
		path := review.User.Avatar.CdnImageUrl()
		avatar = &path
	}

	return &ReviewResponse{
		ID:      int64(review.ID),
		Rating:  review.Rating,
		Comment: review.Comment,
		Author: ReviewAuthorResponse{
			Username: review.User.Username,
			Avatar:   avatar,
			IsSelf:   userJwtClaims != nil && userJwtClaims.UserId == int64(review.UserID),
		},
	}
}

func (self *CreateReviewRequest) getResponse(review *entity.CourseReview, userJwtClaims *utils.ClientJwtClaims) *ReviewResponse {
	return buildResponse(review, userJwtClaims)
}
func (self *UpdateReviewRequest) getResponse(review *entity.CourseReview, userJwtClaims *utils.ClientJwtClaims) *ReviewResponse {
	return buildResponse(review, userJwtClaims)
}
func (self *ListReviewsRequest) getResponse(reviews []entity.CourseReview, userJwtClaims *utils.ClientJwtClaims) []*ReviewResponse {
	result := make([]*ReviewResponse, len(reviews))
	for i := range reviews {
		result[i] = buildResponse(&reviews[i], userJwtClaims)
	}
	return result
}
