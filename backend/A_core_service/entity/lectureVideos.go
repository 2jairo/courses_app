package entity

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type LectureVideo struct {
	entitycommon.Model
	FileID entitycommon.Id

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
