package course

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
)

type UpdateCourseInput struct {
	CourseId            entitycommon.Id
	Title               *string
	Description         *string
	PosterFileId        *entitycommon.Id
	Visibility          *entity.CourseVisibility
	LectureAccesibility *entity.CourseLectureAccesibility
	Language            *entity.CourseLanguage
}

type WatchCourseInput struct {
	CourseSlug entitycommon.Slug
	UserId     *entitycommon.Id
}
