package courseprogress

import (
	"sort"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
)

type CourseProgressWrapper struct {
	progress     []entity.CourseProgress
	seenLectures map[entitycommon.Id]time.Time
}

func NewCourseProgressWrapper(progress []entity.CourseProgress) *CourseProgressWrapper {
	cpMap := make(map[entitycommon.Id]time.Time, len(progress))
	for _, cp := range progress {
		cpMap[cp.LectureID] = cp.UpdatedAt
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

	latest := self.progress[0].UpdatedAt
	for _, cp := range self.progress {
		if cp.UpdatedAt.After(latest) {
			latest = cp.UpdatedAt
		}
	}
	return &latest
}

func (self *CourseProgressWrapper) CompletedLectures() int32 {
	return int32(len(self.progress))
}

func (self *CourseProgressWrapper) IsLectureSeen(lectureID entitycommon.Id) bool {
	_, seen := self.seenLectures[lectureID]
	return seen
}

func (self *CourseProgressWrapper) GetLastSeenLecture(lectureID entitycommon.Id) *time.Time {
	t, seen := self.seenLectures[lectureID]
	if seen {
		return &t
	}
	return nil
}

func (self *CourseProgressWrapper) ComputeBlockedLectures(
	accessibility entity.CourseLectureAccesibility,
	sections []entity.CourseSection,
) map[entitycommon.Id]bool {
	blocked := make(map[entitycommon.Id]bool)

	// Sort a shallow copy of sections by position, and each section's lectures by position
	sortedSections := make([]entity.CourseSection, len(sections))
	copy(sortedSections, sections)
	sort.Slice(sortedSections, func(a, b int) bool {
		return sortedSections[a].Position < sortedSections[b].Position
	})
	for i, s := range sortedSections {
		sortedLectures := make([]entity.Lecture, len(s.Lectures))
		copy(sortedLectures, s.Lectures)
		sort.Slice(sortedLectures, func(a, b int) bool {
			return sortedLectures[a].Position < sortedLectures[b].Position
		})
		sortedSections[i].Lectures = sortedLectures
	}

	prevLectureSeen := true
	pendingGate := false

	for i, s := range sortedSections {
		sectionLocked := false
		if accessibility == entity.LectureAccesibilitySection && i > 0 {
			for _, pl := range sortedSections[i-1].Lectures {
				if !self.IsLectureSeen(pl.ID) {
					sectionLocked = true
					break
				}
			}
		}

		for j, l := range s.Lectures {
			seen := self.IsLectureSeen(l.ID)

			switch accessibility {
			case entity.LectureAccesibilityClosed:
				blocked[l.ID] = !(i == 0 && j == 0) && !prevLectureSeen
			case entity.LectureAccesibilitySection:
				blocked[l.ID] = sectionLocked
			case entity.LectureAccesibilityQuizOrLab:
				blocked[l.ID] = pendingGate

				if !pendingGate && (l.Kind == entity.LectureKindQuiz || l.Kind == entity.LectureKindLab) {
					pendingGate = !seen
				}
			}

			if l.Visibility == entity.LectureVisibilityPrivate {
				blocked[l.ID] = true
			}
			prevLectureSeen = seen
		}
	}

	return blocked
}
