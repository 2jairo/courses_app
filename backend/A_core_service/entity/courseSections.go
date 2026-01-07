package entity

import "gorm.io/gorm"

type CourseSection struct {
	Model
	CourseID int64  `gorm:"not null"`
	Position int    `gorm:"not null"`
	Title    string `gorm:"not null"`

	// relations
	Course Course
}

func (cs *CourseSection) BeforeDelete(tx *gorm.DB) error {
	if tx.Statement.Unscoped {
		return nil
	}

	return tx.
		Where(&Lecture{CourseSectionID: cs.ID}).
		Delete(&Lecture{}).
		Error
}
