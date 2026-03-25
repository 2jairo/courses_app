package course

import "github.com/2jairo/courses_app/backend/A_core_service/entity"

type CreateCourseOutput struct {
	Course      *entity.Course
	Permissions *entity.CoursePermissions
}

type WatchCourseOutput struct {
	Course     *entity.Course
	Owner      *entity.User
	IsFavorite bool
}
