package entity

import (
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gosimple/slug"
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
	UpdatedAt      time.Time        `gorm:"type:timestamptz;not null;default:now()"`
	Visibility     CourseVisibility `gorm:"type:CourseVisibility;not null;default:'Private'"`
	Slug           string           `gorm:"not null"`
	Title          string           `gorm:"not null"`
	Description    string           `gorm:"not null;default:''"`
	Poster         *string          `gorm:"type:varchar(50)"`
	LecturesAmount int32            `gorm:"not null;default:0"`

	// relations
	Sections []CourseSection `gorm:"foreignKey:CourseID"`
	Files    []File          `gorm:"foreignKey:CourseID"`
}

func (c *Course) Slugify() {
	u, _ := uuid.NewV7()
	uStr := strings.ReplaceAll(u.String(), "-", "")

	c.Slug = slug.Make(c.Title) + "-" + uStr
}

func (c *Course) BeforeCreate(tx *gorm.DB) error {
	c.Slugify()
	return nil
}

func (c *Course) BeforeUpdate(tx *gorm.DB) error {
	if len(c.Title) > 0 {
		c.Slugify()
	}
	return nil
}

func (c *Course) BeforeDelete(tx *gorm.DB) error {
	if tx.Statement.Unscoped {
		return nil
	}

	return tx.
		Where(&CourseSection{CourseID: c.ID}).
		Delete(&CourseSection{}).
		Error
}
