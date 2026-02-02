package services

import (
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/course"
	coursepermissions "github.com/2jairo/courses_app/backend/A_core_service/application/services/coursePermissions"
	courseprogress "github.com/2jairo/courses_app/backend/A_core_service/application/services/courseProgress"
	coursesection "github.com/2jairo/courses_app/backend/A_core_service/application/services/courseSection"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/file"
	filevideo "github.com/2jairo/courses_app/backend/A_core_service/application/services/fileVideo"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/lecture"
	lectureasset "github.com/2jairo/courses_app/backend/A_core_service/application/services/lectureAsset"
	"github.com/2jairo/courses_app/backend/A_core_service/application/services/middlewares"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type AppServices struct {
	Middleware        middlewares.MiddlewareService
	Course            course.CourseService
	CoursePermissions coursepermissions.CoursePermissionsService
	CourseSection     coursesection.CourseSectionService
	CourseProgress    courseprogress.CourseProgressService
	Lecture           lecture.LectureService
	LectureAsset      lectureasset.LectureAssetService
	File              file.FileService
	FileVideo         filevideo.FileVideoService
}

func NewAppServices(repo *infrastructure.AppRepositories, u *utils.AppUtils) *AppServices {
	return &AppServices{
		Middleware:        middlewares.MiddlewareService{Repo: repo, Utils: u},
		Course:            course.CourseService{Repo: repo},
		CoursePermissions: coursepermissions.CoursePermissionsService{Repo: repo},
		CourseSection:     coursesection.CourseSectionService{Repo: repo},
		CourseProgress:    courseprogress.CourseProgressService{Repo: repo},
		Lecture:           lecture.LectureService{Repo: repo},
		LectureAsset:      lectureasset.LectureAssetService{Repo: repo},
		File:              file.FileService{Repo: repo},
		FileVideo:         filevideo.FileVideoService{Repo: repo},
	}
}
