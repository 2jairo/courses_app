package entity

import "gorm.io/gorm"

type LectureAsset struct {
	Model
	LectureID int64 `gorm:"not null"`
	FileID    int64 `gorm:"not null"`

	// relations
	Lecture Lecture
	File    File
}
type LectureAssetPreloadOptions struct {
	Lecture bool
	File    bool
}

func (p *LectureAssetPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.Lecture {
		query.Preload(prefix + "Lecture")
	}
	if p.File {
		query.Preload(prefix + "File")
	}
}
