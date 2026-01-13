package entity

import "gorm.io/gorm"

type LectureVideo struct {
	Model
	FileID int64 `gorm:"not null"`

	// relations
	File File
}

type LectureVideoPreloadOptions struct {
	File bool
}

func (p *LectureVideoPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.File {
		query.Preload(prefix + "File")
	}
}
