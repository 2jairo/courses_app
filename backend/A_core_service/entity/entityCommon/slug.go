package entitycommon

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gosimple/slug"
)

type Slug struct {
	Slug string `gorm:"not null"`
}

func (c *Slug) Slugify(title string) {
	c.Slug = slug.Make(title) + "-" + utils.GenerateUUID()
}
