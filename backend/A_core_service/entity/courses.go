package entity

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type CourseVisibility string

const (
	CourseVisibilityPrivate CourseVisibility = "Private"
	CourseVisibilityLink    CourseVisibility = "Link"
	CourseVisibilityPublic  CourseVisibility = "Public"
)

type CourseLectureAccesibility string

const (
	LectureAccesibilityOpen      CourseLectureAccesibility = "Open"      // every lecture is accesible
	LectureAccesibilitySection   CourseLectureAccesibility = "Section"   // complete every lecture of the section to access the next
	LectureAccesibilityQuizOrLab CourseLectureAccesibility = "QuizOrLab" // complete the nearest quiz or lab to access the next
	LectureAccesibilityClosed    CourseLectureAccesibility = "Closed"    // complete prev lecture to access the next
)

type CourseLanguage string

const (
	CourseLanguageES CourseLanguage = "es"
	CourseLanguageEN CourseLanguage = "en"
	CourseLanguageFR CourseLanguage = "fr"
	CourseLanguageDE CourseLanguage = "de"
	CourseLanguageIT CourseLanguage = "it"
	CourseLanguagePT CourseLanguage = "pt"
	CourseLanguageRU CourseLanguage = "ru"
	CourseLanguageZH CourseLanguage = "zh"
	CourseLanguageJA CourseLanguage = "ja"
	CourseLanguageKO CourseLanguage = "ko"
)

func (l CourseLanguage) IsValid() bool {
	supportedCourseLanguages := []CourseLanguage{
		CourseLanguageES,
		CourseLanguageEN,
		CourseLanguageFR,
		CourseLanguageDE,
		CourseLanguageIT,
		CourseLanguagePT,
		CourseLanguageRU,
		CourseLanguageZH,
		CourseLanguageJA,
		CourseLanguageKO,
	}
	for _, lang := range supportedCourseLanguages {
		if l == lang {
			return true
		}
	}
	return false
}

func (v CourseVisibility) IsValid() bool {
	return v == CourseVisibilityPrivate || v == CourseVisibilityLink || v == CourseVisibilityPublic
}

func (a CourseLectureAccesibility) IsValid() bool {
	return a == LectureAccesibilityOpen ||
		a == LectureAccesibilitySection ||
		a == LectureAccesibilityQuizOrLab ||
		a == LectureAccesibilityClosed
}

type Course struct {
	entitycommon.Model
	UpdatedAt           time.Time                 `gorm:"type:timestamptz;default:now()"`
	Visibility          CourseVisibility          `gorm:"type:CourseVisibility;default:'Private'"`
	LectureAccesibility CourseLectureAccesibility `gorm:"type:CourseVisibility;default:'Open'"`
	entitycommon.Slug
	Title                string
	Description          string `gorm:"default:''"`
	Poster               *entitycommon.Path
	Language             CourseLanguage
	LecturesAmount       int32 `gorm:"default:0"`
	PublicLecturesAmount int32 `gorm:"default:0"`
	Price                int32 `gorm:"default:0"`
	DiscountPercent      int32 `gorm:"default:0"`

	// relations
	Sections      []CourseSection     `gorm:"foreignKey:CourseID"`
	Files         []File              `gorm:"foreignKey:CourseID"`
	Permissions   []CoursePermissions `gorm:"foreignKey:CourseID"`
	UsersProgress []CourseProgress    `gorm:"foreginKey:CourseID"`
	FavCourses    []FavoriteCourse    `gorm:"foreginKey:CourseID"`
	Reviews       []CourseReview      `gorm:"foreginKey:CourseID"`
	Quizzes       []LectureQuiz       `gorm:"foreginKey:CourseID"`
}

type CoursePreloadOptions struct {
	Sections bool
	CourseSectionPreloadOptions
	Files bool
	FilePreloadOptions
	Permissions bool
	CoursePermissionsPreloadOptions
	UsersProgress bool
	CourseProgressPreloadOptions
	FavCorses bool
	FavoriteCoursePreloadOptions
	Reviews bool
	CourseReviewPreloadOptions
	Quizzes bool
	LectureQuizPreloadOptions
}

func (p *CoursePreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.Files {
		query.Preload(prefix + "Files")
		p.FilePreloadOptions.Preload(query, prefix+"Files.")
	}
	if p.Sections {
		query.Preload(prefix + "Sections")
		p.CourseSectionPreloadOptions.Preload(query, prefix+"Sections.")
	}
	if p.Permissions {
		query.Preload(prefix + "Permissions")
		p.CoursePermissionsPreloadOptions.Preload(query, prefix+"Permissions.")
	}
	if p.UsersProgress {
		query.Preload(prefix + "UsersProgress")
		p.CourseProgressPreloadOptions.Preload(query, prefix+"UsersProgress.")
	}
	if p.FavCorses {
		query.Preload(prefix + "FavCourses")
		p.FavoriteCoursePreloadOptions.Preload(query, prefix+"FavCourses.")
	}
	if p.Reviews {
		query.Preload(prefix + "Reviews")
		p.CourseReviewPreloadOptions.Preload(query, prefix+"Reviews.")
	}
	if p.Quizzes {
		query.Preload(prefix + "Quizzes")
		p.CourseReviewPreloadOptions.Preload(query, prefix+"Quizzes.")
	}
}

func (c *Course) BeforeCreate(tx *gorm.DB) error {
	c.Slug.Slugify(c.Title)
	return nil
}

func (c *Course) BeforeUpdate(tx *gorm.DB) error {
	if len(c.Title) > 0 {
		c.Slug.Slugify(c.Title)
	}
	return nil
}

func (c *Course) BeforeDelete(tx *gorm.DB) error {
	if tx.Statement.Unscoped {
		return nil
	}

	// sections -> lectures -> {assets, lecture_data}
	for _, section := range c.Sections {
		if err := tx.Delete(&section).Error; err != nil {
			return err
		}
	}
	if len(c.Permissions) > 0 {
		if err := tx.Delete(&c.Permissions).Error; err != nil {
			return err
		}
	}
	if len(c.UsersProgress) > 0 {
		if err := tx.Delete(&c.UsersProgress).Error; err != nil {
			return err
		}
	}
	if len(c.FavCourses) > 0 {
		if err := tx.Delete(&c.FavCourses).Error; err != nil {
			return err
		}
	}
	if len(c.Reviews) > 0 {
		if err := tx.Delete(&c.Reviews).Error; err != nil {
			return err
		}
	}
	if len(c.Quizzes) > 0 {
		if err := tx.Delete(&c.Quizzes).Error; err != nil {
			return err
		}
	}
	if len(c.Files) > 0 {
		if err := tx.Delete(&c.Files).Error; err != nil {
			return err
		}
	}

	return nil
}
