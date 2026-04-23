package courses

import (
	"slices"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/application/services/course"
	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/entity/analytics"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	coursesections "github.com/2jairo/courses_app/backend/A_core_service/presentation/http/api/courseSections"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type CourseResponse struct {
	ID                  int64                            `json:"id"`
	Slug                string                           `json:"slug"`
	UpdatedAt           time.Time                        `json:"updatedAt"`
	Visibility          entity.CourseVisibility          `json:"visibility"`
	LectureAccesibility entity.CourseLectureAccesibility `json:"lectureAccesibility"`
	Title               string                           `json:"title"`
	Description         string                           `json:"description"`
	Poster              *string                          `json:"poster"`
	LecturesAmmount     int32                            `json:"lecturesAmmount"`
	Tags                []CourseTagsRespone              `json:"tags"`
	utils.PriceDiscountCurrency
	PublicLecturesAmmount int32                        `json:"publicLecturesAmmount"`
	Language              entity.CourseLanguage        `json:"language"`
	Role                  entity.CoursePermissionsRole `json:"role"`
	Stats                 CourseStatsResponse          `json:"stats"`
}
type CourseTagsRespone struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}
type CourseStatsResponse struct {
	AvgRating      float64 `json:"avgRating"`
	TotalReviews   uint64  `json:"totalReviews"`
	TotalPurchases uint64  `json:"totalPurchases"`
	TotalViews     uint64  `json:"totalViews"`
}

type ExtendedCourseResponse struct {
	*CourseResponse
	Sections []ExtendedCourseResponseSection `json:"sections"`
}
type ExtendedCourseResponseSection struct {
	coursesections.CourseSectionResponse
	Lectures []ExtendedCourseResponseLecture `json:"lectures"`
}
type ExtendedCourseResponseLecture struct {
	ID                    int64                    `json:"id"`
	Slug                  string                   `json:"slug"`
	CreatedAt             time.Time                `json:"createdAt"`
	Visibility            entity.LectureVisibility `json:"visibility"`
	CourseSectionId       int64                    `json:"courseSectionId"`
	Position              int                      `json:"position"`
	Kind                  entity.LectureKind       `json:"kind"`
	Title                 string                   `json:"title"`
	Description           string                   `json:"description"`
	EstimatedDurationSecs int32                    `json:"estimatedDurationSecs"`
}

func createOrUpdateCourseResponse(
	course *entity.Course,
	courseTags []entity.CourseTag,
	permissions *entity.CoursePermissions,
	stats *analytics.CourseStats,
) *CourseResponse {
	var poster *string = nil
	if course.Poster != nil {
		path := course.Poster.CdnImageUrl()
		poster = &path
	}

	tags := make([]CourseTagsRespone, len(courseTags))
	for i, tag := range courseTags {
		tags[i] = CourseTagsRespone{
			Name: tag.Tag.Name,
			Slug: tag.Tag.Slug.Slug,
		}
	}

	return &CourseResponse{
		ID:                    int64(course.ID),
		UpdatedAt:             course.UpdatedAt,
		Visibility:            course.Visibility,
		LectureAccesibility:   course.LectureAccesibility,
		Slug:                  course.Slug.Slug,
		Title:                 course.Title,
		Description:           course.Description,
		Poster:                poster,
		LecturesAmmount:       course.LecturesAmount,
		Tags:                  tags,
		PublicLecturesAmmount: course.PublicLecturesAmount,
		PriceDiscountCurrency: utils.PriceDiscountCurrency{
			Price:           course.Price,
			Currency:        config.TmpCurrency,
			DiscountPercent: course.DiscountPercent,
			IsFree:          course.DiscountedPrice() == 0,
		},
		Language: course.Language,
		Role:     permissions.Role,
		Stats: CourseStatsResponse{
			AvgRating:      stats.AvgRating,
			TotalReviews:   stats.TotalReviews,
			TotalPurchases: stats.TotalPurchases,
			TotalViews:     stats.TotalViews,
		},
	}
}

func (self *CreateCourseRequest) getResponse(course *entity.Course, courseTags []entity.CourseTag, permissions *entity.CoursePermissions, stats *analytics.CourseStats) *CourseResponse {
	return createOrUpdateCourseResponse(course, courseTags, permissions, stats)
}

func (self *UpdateCourseRequest) getResponse(course *entity.Course, courseTags []entity.CourseTag, permissions *entity.CoursePermissions, stats *analytics.CourseStats) *CourseResponse {
	return createOrUpdateCourseResponse(course, courseTags, permissions, stats)
}

func (self *GetDashboardCourses) getResponse(permissionsWithCourse []course.GetCoursesWithPermissionsOutput, courseTags map[entitycommon.Id][]entity.CourseTag) []*CourseResponse {
	responses := make([]*CourseResponse, len(permissionsWithCourse))
	for i, p := range permissionsWithCourse {
		responses[i] = createOrUpdateCourseResponse(p.WithPermissions.Course, courseTags[p.WithPermissions.Course.ID], p.WithPermissions, p.Stats)
	}
	return responses
}

func getExtendedCourseSection(section *entity.CourseSection, course *entity.Course) ExtendedCourseResponseSection {
	lecturesArray := make([]ExtendedCourseResponseLecture, len(section.Lectures))
	for j, lecture := range section.Lectures {
		lecturesArray[j] = ExtendedCourseResponseLecture{
			ID:                    int64(lecture.ID),
			Slug:                  lecture.Slug.Slug,
			Title:                 lecture.Title,
			Description:           lecture.Description,
			Visibility:            lecture.Visibility,
			CourseSectionId:       int64(section.ID),
			Kind:                  lecture.Kind,
			CreatedAt:             lecture.CreatedAt,
			Position:              lecture.Position,
			EstimatedDurationSecs: lecture.EstimatedDurationSecs,
		}
	}

	slices.SortFunc(lecturesArray, func(a, b ExtendedCourseResponseLecture) int {
		return a.Position - b.Position
	})

	return ExtendedCourseResponseSection{
		CourseSectionResponse: coursesections.CourseSectionResponse{
			ID:       int64(section.ID),
			Position: section.Position,
			Title:    section.Title,
			Slug:     section.Slug.Slug,
			// CourseUpdatedAt: course.UpdatedAt,
		},
		Lectures: lecturesArray,
	}
}

func (self *GetCourseDetailsRequest) getResponse(course *entity.Course, courseTags []entity.CourseTag, permissions *entity.CoursePermissions, stats *analytics.CourseStats) *ExtendedCourseResponse {
	sections := make([]ExtendedCourseResponseSection, len(course.Sections))
	for i, section := range course.Sections {
		sections[i] = getExtendedCourseSection(&section, course)
	}

	slices.SortFunc(sections, func(a, b ExtendedCourseResponseSection) int {
		return a.Position - b.Position
	})

	return &ExtendedCourseResponse{
		CourseResponse: createOrUpdateCourseResponse(course, courseTags, permissions, stats),
		Sections:       sections,
	}
}
