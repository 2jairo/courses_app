package courseprogress

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
)

type CourseProgressService struct {
	Repo *infrastructure.AppRepositories
}

func (self *CourseProgressService) GetUserCourseProgress(courseID entitycommon.Id, userId entitycommon.Id) (*CourseProgressWrapper, error) {
	var err error
	progress := []entity.CourseProgress{}

	progress, err = self.Repo.CourseProgress.Find(
		&entity.CourseProgress{UserID: userId, CourseID: courseID},
	)
	if err != nil {
		return nil, err
	}

	progressWrapper := NewCourseProgressWrapper(progress)
	return progressWrapper, nil
}
