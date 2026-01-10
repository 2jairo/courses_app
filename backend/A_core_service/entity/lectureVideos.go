package entity

import "gorm.io/gorm"

type LectureVideo struct {
	Model
	VideoID int64 `gorm:"not null"`

	// relations
	Video File
}

type LectureVideoPreloadOptions struct {
	Video bool
}

func (p *LectureVideoPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.Video {
		query.Preload(prefix + "Video")
	}
}
