package entity

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

const COURSE_MAX_TAGS = 10

type CourseTag struct {
	CourseID entitycommon.Id `gorm:"type:bigint;primaryKey"`
	TagID    entitycommon.Id `gorm:"type:bigint;primaryKey"`

	// Relations
	Course *Course `gorm:"foreignKey:CourseID"`
	Tag    *Tag    `gorm:"foreignKey:TagID"`
}

type CourseTagPreloadOptions struct {
	Course bool
	*CoursePreloadOptions
	Tag bool
	*TagPreloadOptions
}

// Preload method for CourseTag
func (p *CourseTagPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.Course {
		query.Preload(prefix + "Course")
		if p.CoursePreloadOptions != nil {
			p.CoursePreloadOptions.Preload(query, prefix+"Course.")
		}
	}
	if p.Tag {
		query.Preload(prefix + "Tag")
		if p.TagPreloadOptions != nil {
			p.TagPreloadOptions.Preload(query, prefix+"Tag.")
		}
	}
}
