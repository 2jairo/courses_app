package entity

import (
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
	Model
	Visibility      LectureVisibility `gorm:"type:LectureVisibility;not null;default:'Private'"`
	CourseSectionID int64             `gorm:"not null"`
	Position        int               `gorm:"not null"`
	Kind            LectureKind       `gorm:"type:LectureKind;not null"`
	Title           string            `gorm:"not null"`
	Slug
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

func (c *Lecture) BeforeCreate(tx *gorm.DB) error {
	c.Slug.Slugify(c.Title)
	return nil
}

func (c *Lecture) BeforeUpdate(tx *gorm.DB) error {
	if len(c.Title) > 0 {
		c.Slug.Slugify(c.Title)
	}
	return nil
}

func (l *Lecture) BeforeDelete(tx *gorm.DB) error {
	if tx.Statement.Unscoped {
		return nil
	}

	switch l.Kind {
	case LectureKindVideo:
		if err := tx.Delete(&LectureVideo{Model: Model{ID: l.Data}}).Error; err != nil {
			return err
		}
	case LectureKindDocument:
	case LectureKindLab:
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
