package entity

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type CourseSection struct {
	entitycommon.Model
	CourseID entitycommon.Id
	Position int
	Title    string
	entitycommon.Slug

	// relations
	Course   *Course   `gorm:"foreignKey:CourseID"`
	Lectures []Lecture `gorm:"foreignKey:CourseSectionID"`
}

type CourseSectionPreloadOptions struct {
	Course   bool
	Lectures bool
	LecturePreloadOptions
}

func (p *CourseSectionPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.Course {
		query.Preload(prefix + "Course")
	}
	if p.Lectures {
		query.Preload(prefix + "Lectures")
		p.LecturePreloadOptions.Preload(query, prefix+"Lectures.")
	}
}

func (c *CourseSection) BeforeCreate(tx *gorm.DB) error {
	c.Slug.Slugify(c.Title)
	return nil
}

func (c *CourseSection) BeforeUpdate(tx *gorm.DB) error {
	if len(c.Title) > 0 {
		c.Slug.Slugify(c.Title)
	}
	return nil
}

func (cs *CourseSection) BeforeDelete(tx *gorm.DB) error {
	if tx.Statement.Unscoped {
		return nil
	}

	for _, lecture := range cs.Lectures {
		if err := tx.Delete(&lecture).Error; err != nil {
			return err
		}
	}
	return nil
}
