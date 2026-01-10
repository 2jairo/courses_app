package utils

import "gorm.io/gorm"

type ValidatorEnum interface {
	IsValid() bool
}

type PreloadOptions interface {
	Preload(db *gorm.DB, prefix string)
}
