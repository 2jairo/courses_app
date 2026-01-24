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

func (v CourseVisibility) IsValid() bool {
	return v == CourseVisibilityPrivate || v == CourseVisibilityLink || v == CourseVisibilityPublic
}

type Course struct {
	entitycommon.Model
	UpdatedAt  time.Time        `gorm:"type:timestamptz;not null;default:now()"`
	Visibility CourseVisibility `gorm:"type:CourseVisibility;not null;default:'Private'"`
	entitycommon.Slug
	Title          string             `gorm:"not null"`
	Description    string             `gorm:"not null;default:''"`
	Poster         *entitycommon.Path `gorm:"type:varchar(50)"`
	LecturesAmount int32              `gorm:"not null;default:0"`

	// relations
	Sections    []CourseSection     `gorm:"foreignKey:CourseID"`
	Files       []File              `gorm:"foreignKey:CourseID"`
	Permissions []CoursePermissions `gorm:"foreignKey:CourseID"`
}

type CoursePreloadOptions struct {
	Sections bool
	CourseSectionPreloadOptions
	Files bool
	FilePreloadOptions
	Permissions bool
	CoursePermissionsPreloadOptions
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

	// TODO: delete not used files
	// sections -> lectures -> {assets, lecture_data}
	for _, section := range c.Sections {
		if err := tx.Delete(&section).Error; err != nil {
			return err
		}
	}
	for _, permissions := range c.Permissions {
		if err := tx.Delete(&permissions).Error; err != nil {
			return err
		}
	}

	return nil
}
