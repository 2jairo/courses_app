package coursetags

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
)

type CourseTagsService struct {
	Repo *infrastructure.AppRepositories
}

func (s *CourseTagsService) SetCourseTags(input SetCourseTagsInput) ([]entity.CourseTag, error) {
	tags := make([]entity.Tag, len(input.Tags))

	for i, t := range input.Tags {
		tags[i] = entity.Tag{Name: t.Name}
	}
	if err := s.Repo.Tags.CreateBatch(tags); err != nil {
		return nil, global.Err(err)
	}

	courseTags := make([]entity.CourseTag, len(tags))
	for i, t := range tags {
		courseTags[i] = entity.CourseTag{
			CourseID: input.CourseID,
			TagID:    t.ID,
			Tag:      &t,
		}
	}

	err := s.Repo.CourseTags.CreateBatch(courseTags)
	return courseTags, global.Err(err)
}

func (s *CourseTagsService) GetCourseTags(input GetCourseTagsInput) ([]entity.CourseTag, error) {
	return s.Repo.CourseTags.Find(
		&entity.CourseTag{CourseID: input.CourseID},
		entity.CourseTagPreloadOptions{Tag: true},
		nil,
	)
}

func (s *CourseTagsService) GetTags(input GetTagsInput) ([]entity.Tag, error) {
	return s.Repo.Tags.FindTagsWithPrefix(entity.TagPreloadOptions{}, input.Pagination, input.QueryByName)
}
