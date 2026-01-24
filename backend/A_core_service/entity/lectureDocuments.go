package entity

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type LectureDocument struct {
	entitycommon.Model
	Body string `gorm:"not null"`
}

type LectureDocumentPreloadOptions struct {
}

func (p *LectureDocumentPreloadOptions) Preload(query *gorm.DB, prefix string) {
}
