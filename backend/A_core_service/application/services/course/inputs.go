package course

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type CreateCourseInput struct {
	Course *entity.Course
	UserId entitycommon.Id
}

type GetCoursesWithPermissionsInput struct {
	UserId       entitycommon.Id
	Preload      entity.CoursePermissionsPreloadOptions
	Pagination   *utils.Pagination
	QueryByTitle string
}

type GetCourseDetailsInput struct {
	CourseId entitycommon.Id
}

type DeleteCourseInput struct {
	CourseId entitycommon.Id
}

type FindPublicCoursesInput struct {
	Pagination   *utils.Pagination
	QueryByTitle string
}

type GetCourseWithSectionsAndLecturesInput struct {
	CourseId entitycommon.Id
}

type UpdateCourseInput struct {
	CourseId            entitycommon.Id
	Title               *string
	Description         *string
	PosterFileId        *entitycommon.Id
	Visibility          *entity.CourseVisibility
	LectureAccesibility *entity.CourseLectureAccesibility
	Language            *entity.CourseLanguage
	Price               *int32
	DiscountPercent     *int32
}

type WatchCourseInput struct {
	CourseSlug entitycommon.Slug
	UserId     *entitycommon.Id
}
