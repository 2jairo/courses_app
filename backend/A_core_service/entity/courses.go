package entity

import (
	"time"

	"gorm.io/gorm"
)

type CourseVisibility string

const (
	CourseVisibilityPrivate CourseVisibility = "Private"
	CourseVisibilityLink    CourseVisibility = "Link"
	CourseVisibilityPublic  CourseVisibility = "Public"
)

func (v CourseVisibility) IsValid() bool {
	return v == CourseVisibilityPrivate || v == CourseVisibilityLink || v == CourseVisibilityPublic
}

type Course struct {
	Model
	UpdatedAt  time.Time        `gorm:"type:timestamptz;not null;default:now()"`
	Visibility CourseVisibility `gorm:"type:CourseVisibility;not null;default:'Private'"`
	Slug
	Title          string  `gorm:"not null"`
	Description    string  `gorm:"not null;default:''"`
	Poster         *string `gorm:"type:varchar(50)"`
	LecturesAmount int32   `gorm:"not null;default:0"`

	// relations
	Sections []CourseSection `gorm:"foreignKey:CourseID"`
	Files    []File          `gorm:"foreignKey:CourseID"`
}

type CoursePreloadOptions struct {
	Sections bool
	CourseSectionPreloadOptions
	Files bool
	FilePreloadOptions
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

	for _, section := range c.Sections {
		if err := tx.Delete(&section).Error; err != nil {
			return err
		}
	}
	return nil
}
