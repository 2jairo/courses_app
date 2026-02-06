package entitycommon

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"gorm.io/gorm"
)

type PreloadOptions interface {
	Preload(db *gorm.DB, prefix string)
}

type PreloadOrJoin[T utils.PreloadOptions] struct {
	Value T
}

func (gpo *PreloadOrJoin[T]) Preload(db *gorm.DB, prefix string) {
	gpo.Value.Preload(db, prefix)
}
