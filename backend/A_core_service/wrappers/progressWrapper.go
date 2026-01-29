package wrappers

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type CourseProgressWrapper struct {
	progress     []entity.CourseProgress
	seenLectures map[int64]struct{}
}

func NewCourseProgressWrapper(progress []entity.CourseProgress) *CourseProgressWrapper {
	cpMap := make(map[int64]struct{}, len(progress))
	for _, cp := range progress {
		cpMap[cp.LectureID] = struct{}{}
	}
	return &CourseProgressWrapper{
		progress:     progress,
		seenLectures: cpMap,
	}
}

func (self *CourseProgressWrapper) LastSeenTime() *time.Time {
	if len(self.progress) == 0 {
		return nil
	}

	latest := self.progress[0].CreatedAt
	for _, cp := range self.progress {
		if cp.CreatedAt.After(latest) {
			latest = cp.CreatedAt
		}
	}
	return &latest
}

func (self *CourseProgressWrapper) CompletedLectures() int32 {
	return int32(len(self.progress))
}

func (self *CourseProgressWrapper) IsLectureSeen(lectureID int64) bool {
	_, seen := self.seenLectures[lectureID]
	return seen
}
