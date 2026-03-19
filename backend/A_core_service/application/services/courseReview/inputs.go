package coursereview

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type CreateReviewInput struct {
	UserID     entitycommon.Id
	CourseSlug string
	Rating     int32
	Comment    string
}

type UpdateReviewInput struct {
	ReviewID entitycommon.Id
	UserID   entitycommon.Id
	Rating   *int32
	Comment  *string
}

type FindReviewsInput struct {
	CourseSlug string
	Pagination *utils.Pagination
	Rating     int32
}
