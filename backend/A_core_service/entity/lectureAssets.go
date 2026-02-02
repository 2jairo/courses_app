package entity

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type LectureAsset struct {
	entitycommon.Model
	LectureID entitycommon.Id `gorm:"not null"`
	FileID    entitycommon.Id `gorm:"not null"`

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
