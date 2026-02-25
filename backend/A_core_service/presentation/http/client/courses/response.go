package courses

import (
	"time"

	courseprogress "github.com/2jairo/courses_app/backend/A_core_service/application/services/courseProgress"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
)

type CourseResponse struct {
	UpdatedAt             time.Time                        `json:"updatedAt"`
	Visibility            entity.CourseVisibility          `json:"visibility"`
	LectureAccesibility   entity.CourseLectureAccesibility `json:"lectureAccesibility"`
	Slug                  string                           `json:"slug"`
	Title                 string                           `json:"title"`
	Description           string                           `json:"description"`
	Poster                *string                          `json:"poster"`
	LecturesAmmount       int32                            `json:"lecturesAmmount"`
	PublicLecturesAmmount int32                            `json:"publicLecturesAmmount"`
}

type WatchCourseResponse struct {
	UpdatedAt             time.Time                        `json:"updatedAt"`
	Visibility            entity.CourseVisibility          `json:"visibility"`
	LectureAccesibility   entity.CourseLectureAccesibility `json:"lectureAccesibility"`
	Slug                  string                           `json:"slug"`
	Title                 string                           `json:"title"`
	Description           string                           `json:"description"`
	Poster                *string                          `json:"poster"`
	LecturesAmmount       int32                            `json:"lecturesAmmount"`
	PublicLecturesAmmount int32                            `json:"publicLecturesAmmount"`

	LastSeenTime      *time.Time                    `json:"lastSeenTime"`
	CompletedLectures int32                         `json:"completedLectures"`
	Role              *entity.CoursePermissionsRole `json:"role"`
	Id                int64                         `json:"id"`
	LectureAssets     int32                         `json:"lectureAssets"`
	Sections          []WatchCourseSectionResponse  `json:"sections"`
}
type WatchCourseSectionResponse struct {
	Slug     string                       `json:"slug"`
	Position int                          `json:"position"`
	Title    string                       `json:"title"`
	Lectures []WatchCourseLectureResponse `json:"lectures"`
}
type WatchCourseLectureResponse struct {
	Id                    int64                             `json:"id"`
	Slug                  string                            `json:"slug"`
	CreatedAt             time.Time                         `json:"createdAt"`
	Visibility            entity.LectureVisibility          `json:"visibility"`
	IsBlocked             bool                              `json:"isBlocked"`
	Position              int                               `json:"position"`
	Kind                  entity.LectureKind                `json:"kind"`
	Title                 string                            `json:"title"`
	Description           string                            `json:"description"`
	EstimatedDurationSecs int32                             `json:"estimatedDurationSecs"`
	Seen                  bool                              `json:"seen"`
	Assets                []WatchCourseLectureAssetResponse `json:"assets"`
}
type WatchCourseLectureAssetResponse struct {
	Name   string          `json:"name"`
	Size   int64           `json:"size"`
	Kind   entity.FileKind `json:"kind"`
	FileId int64           `json:"fileId"`
}

func createCourseResponse(course *entity.Course) *CourseResponse {
	var poster *string = nil
	if course.Poster != nil {
		path := course.Poster.CdnImageUrl()
		poster = &path
	}

	return &CourseResponse{
		UpdatedAt:             course.UpdatedAt,
		Visibility:            course.Visibility,
		LectureAccesibility:   course.LectureAccesibility,
		Slug:                  course.Slug.Slug,
		Title:                 course.Title,
		Description:           course.Description,
		Poster:                poster,
		LecturesAmmount:       course.LecturesAmount,
		PublicLecturesAmmount: course.PublicLecturesAmount,
	}
}

func (self *FindCoursesRequest) getResponse(courses []entity.Course) []*CourseResponse {
	responses := make([]*CourseResponse, len(courses))
	for i, c := range courses {
		responses[i] = createCourseResponse(&c)
	}
	return responses
}

func (self *WatchCourseRequest) getResponse(
	course *entity.Course,
	progress *courseprogress.CourseProgressWrapper,
	permissions *entity.CoursePermissions,
) *WatchCourseResponse {
	sections := make([]WatchCourseSectionResponse, len(course.Sections))
	uniqueAssetFileIds := make(map[entitycommon.Id]bool)

	blockedLectures := progress.ComputeBlockedLectures(course.LectureAccesibility, course.Sections)

	for i, s := range course.Sections {
		lectures := make([]WatchCourseLectureResponse, len(s.Lectures))

		for j, l := range s.Lectures {
			assets := make([]WatchCourseLectureAssetResponse, len(l.Assets))
			for k, asset := range l.Assets {
				uniqueAssetFileIds[asset.File.ID] = true

				assets[k] = WatchCourseLectureAssetResponse{
					Name:   asset.File.OriginalName,
					Size:   asset.File.FileSize,
					Kind:   asset.File.Kind,
					FileId: int64(asset.File.ID),
				}
			}

			lectures[j] = WatchCourseLectureResponse{
				Id:                    int64(l.ID),
				Slug:                  l.Slug.Slug,
				CreatedAt:             l.CreatedAt,
				Visibility:            l.Visibility,
				IsBlocked:             blockedLectures[l.ID],
				Position:              l.Position,
				Kind:                  l.Kind,
				Title:                 l.Title,
				Description:           l.Description,
				EstimatedDurationSecs: l.EstimatedDurationSecs,
				Seen:                  progress.IsLectureSeen(l.ID),
				Assets:                assets,
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

	var role *entity.CoursePermissionsRole = nil
	if permissions != nil {
		role = &permissions.Role
	}

	return &WatchCourseResponse{
		UpdatedAt:             course.UpdatedAt,
		Visibility:            course.Visibility,
		LectureAccesibility:   course.LectureAccesibility,
		Slug:                  course.Slug.Slug,
		Title:                 course.Title,
		Description:           course.Description,
		Poster:                poster,
		LecturesAmmount:       course.LecturesAmount,
		PublicLecturesAmmount: course.PublicLecturesAmount,
		LastSeenTime:          progress.LastSeenTime(),
		CompletedLectures:     progress.CompletedLectures(),
		Role:                  role,
		Id:                    int64(course.ID),
		LectureAssets:         int32(len(uniqueAssetFileIds)),
		Sections:              sections,
	}
}
