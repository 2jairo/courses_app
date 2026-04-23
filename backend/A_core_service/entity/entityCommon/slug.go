package entitycommon

import (
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gosimple/slug"
)

type Slug struct {
	Slug string
}

func (c *Slug) Slugify(title string, withUuid bool) {
	c.Slug = slug.Make(title)
	if withUuid {
		c.Slug += "-" + utils.GenerateUUID()
	}
}
