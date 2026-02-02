package courses

import (
	"time"

	courseprogress "github.com/2jairo/courses_app/backend/A_core_service/application/services/courseProgress"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
)

type CourseResponse struct {
	UpdatedAt       time.Time               `json:"updatedAt"`
	Visibility      entity.CourseVisibility `json:"visibility"`
	Slug            string                  `json:"slug"`
	Title           string                  `json:"title"`
	Description     string                  `json:"description"`
	Poster          *string                 `json:"poster"`
	LecturesAmmount int32                   `json:"lecturesAmmount"`
}

type WatchCourseResponse struct {
	UpdatedAt         time.Time                    `json:"updatedAt"`
	Visibility        entity.CourseVisibility      `json:"visibility"`
	Slug              string                       `json:"slug"`
	Title             string                       `json:"title"`
	Description       string                       `json:"description"`
	Poster            *string                      `json:"poster"`
	LecturesAmmount   int32                        `json:"lecturesAmmount"`
	LastSeenTime      *time.Time                   `json:"lastSeenTime"`
	CompletedLectures int32                        `json:"completedLectures"`
	Sections          []WatchCourseSectionResponse `json:"sections"`
}
type WatchCourseSectionResponse struct {
	Slug     string                       `json:"slug"`
	Position int                          `json:"position"`
	Title    string                       `json:"title"`
	Lectures []WatchCourseLectureResponse `json:"lectures"`
}
type WatchCourseLectureResponse struct {
	Slug                  string                   `json:"slug"`
	CreatedAt             time.Time                `json:"createdAt"`
	Visibility            entity.LectureVisibility `json:"visibility"`
	Position              int                      `json:"position"`
	Kind                  entity.LectureKind       `json:"kind"`
	Title                 string                   `json:"title"`
	Description           string                   `json:"description"`
	EstimatedDurationSecs int32                    `json:"estimatedDurationSecs"`
	Seen                  bool                     `json:"seen"`
}

func createCourseResponse(course *entity.Course) *CourseResponse {
	var poster *string = nil
	if course.Poster != nil {
		path := course.Poster.CdnImageUrl()
		poster = &path
	}

	return &CourseResponse{
		UpdatedAt:       course.UpdatedAt,
		Visibility:      course.Visibility,
		Slug:            course.Slug.Slug,
		Title:           course.Title,
		Description:     course.Description,
		Poster:          poster,
		LecturesAmmount: course.LecturesAmount,
	}
}

func (self *FindCoursesRequest) getResponse(courses []entity.Course) []*CourseResponse {
	responses := make([]*CourseResponse, len(courses))
	for i, c := range courses {
		responses[i] = createCourseResponse(&c)
	}
	return responses
}

func (self *WatchCourseRequest) getResponse(course *entity.Course, progress *courseprogress.CourseProgressWrapper) *WatchCourseResponse {
	sections := make([]WatchCourseSectionResponse, len(course.Sections))
	for i, s := range course.Sections {
		lectures := make([]WatchCourseLectureResponse, len(s.Lectures))
		for j, l := range s.Lectures {
			lectures[j] = WatchCourseLectureResponse{
				Slug:                  l.Slug.Slug,
				CreatedAt:             l.CreatedAt,
				Visibility:            l.Visibility,
				Position:              l.Position,
				Kind:                  l.Kind,
				Title:                 l.Title,
				Description:           l.Description,
				EstimatedDurationSecs: l.EstimatedDurationSecs,
				Seen:                  progress.IsLectureSeen(l.ID),
			}
		}
		sections[i] = WatchCourseSectionResponse{
			Slug:     s.Slug.Slug,
			Position: s.Position,
			Title:    s.Title,
			Lectures: lectures,
		}
	}

	var poster *string = nil
	if course.Poster != nil {
		path := course.Poster.CdnImageUrl()
		poster = &path
	}

	return &WatchCourseResponse{
		UpdatedAt:         course.UpdatedAt,
		Visibility:        course.Visibility,
		Slug:              course.Slug.Slug,
		Title:             course.Title,
		Description:       course.Description,
		Poster:            poster,
		LecturesAmmount:   course.LecturesAmount,
		LastSeenTime:      progress.LastSeenTime(),
		CompletedLectures: progress.CompletedLectures(),
		Sections:          sections,
	}
}
