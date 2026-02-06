package entity

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type LectureDocument struct {
	entitycommon.Model
	Body datatypes.JSON `gorm:"type:jsonb"`
}

type LectureDocumentPreloadOptions struct {
}

func (p *LectureDocumentPreloadOptions) Preload(query *gorm.DB, prefix string) {
}
