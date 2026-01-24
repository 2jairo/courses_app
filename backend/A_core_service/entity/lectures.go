package entity

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type LectureVisibility string

const (
	LectureVisibilityPrivate LectureVisibility = "Private"
	LectureVisibilityLink    LectureVisibility = "Link"
	LectureVisibilityPublic  LectureVisibility = "Public"
)

func (v LectureVisibility) IsValid() bool {
	return v == LectureVisibilityPrivate || v == LectureVisibilityLink || v == LectureVisibilityPublic
}

type LectureKind string

const (
	LectureKindVideo    LectureKind = "Video"
	LectureKindDocument LectureKind = "Document"
	LectureKindQuiz     LectureKind = "Quiz"
	LectureKindLab      LectureKind = "Lab"
)

func (k LectureKind) IsValid() bool {
	return k == LectureKindVideo || k == LectureKindDocument || k == LectureKindQuiz || k == LectureKindLab
}

type Lecture struct {
	entitycommon.Model
	Visibility      LectureVisibility `gorm:"type:LectureVisibility;not null;default:'Private'"`
	CourseSectionID int64             `gorm:"not null"`
	Position        int               `gorm:"not null"`
	Kind            LectureKind       `gorm:"type:LectureKind;not null"`
	Title           string            `gorm:"not null"`
	entitycommon.Slug
	Description string `gorm:"not null"`
	Data        int64  `gorm:"not null"`

	// relations
	CourseSection CourseSection  `gorm:"foreignKey:CourseSectionID"`
	Assets        []LectureAsset `gorm:"foreignKey:LectureID"`
}

type LecturePreloadOptions struct {
	CourseSection bool
	Assets        bool
	LectureAssetPreloadOptions
}

func (p *LecturePreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.CourseSection {
		query.Preload(prefix + "CourseSection")
	}
	if p.Assets {
		query.Preload(prefix + "Assets")
		p.LectureAssetPreloadOptions.Preload(query, prefix+"Assets.")
	}
}

func (l *Lecture) BeforeCreate(tx *gorm.DB) error {
	l.Slug.Slugify(l.Title)
	return nil
}

func (l *Lecture) BeforeUpdate(tx *gorm.DB) error {
	if len(l.Title) > 0 {
		l.Slug.Slugify(l.Title)
	}
	return nil
}

func (l *Lecture) BeforeDelete(tx *gorm.DB) error {
	if tx.Statement.Unscoped {
		return nil
	}

	// switchLectureKind
	switch l.Kind {
	case LectureKindVideo:
		if err := tx.Delete(&LectureVideo{Model: entitycommon.Model{ID: l.Data}}).Error; err != nil {
			return err
		}
	case LectureKindDocument:
		if err := tx.Delete(&LectureDocument{Model: entitycommon.Model{ID: l.Data}}).Error; err != nil {
			return err
		}
	case LectureKindLab:
		panic("not implemented")
	case LectureKindQuiz:
		panic("not implemented")
	}

	for _, asset := range l.Assets {
		if err := tx.Delete(&asset).Error; err != nil {
			return err
		}
	}
	return nil
}
