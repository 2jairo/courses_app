package entity

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type Tag struct {
	entitycommon.Model
	entitycommon.Slug
	Name string `gorm:"primaryKey"`

	// Relations
	CourseTags []CourseTag `gorm:"foreignKey:TagID"`
}

type TagPreloadOptions struct {
	CourseTags bool
	*CourseTagPreloadOptions
}

func (p *TagPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.CourseTags {
		query.Preload(prefix + "CourseTags")
		if p.CourseTagPreloadOptions != nil {
			p.CourseTagPreloadOptions.Preload(query, prefix+"CourseTags.")
		}
	}
}

func (c *Tag) BeforeCreate(tx *gorm.DB) error {
	c.Slug.Slugify(c.Name, false)
	return nil
}

func (c *Tag) BeforeUpdate(tx *gorm.DB) error {
	if len(c.Name) > 0 {
		c.Slug.Slugify(c.Name, false)
	}
	return nil
}
