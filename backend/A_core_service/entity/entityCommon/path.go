package entitycommon

import "github.com/2jairo/courses_app/backend/A_core_service/config"

type Path string

func (self *Path) CdnFileBaseUrl(fileId int64) string {
	return config.CdnServiceUrl.FileBaseUrl(fileId)
}

func (self *Path) CdnImageUrl() string {
	return config.CdnServiceUrl.ImageUrl(string(*self))
}
