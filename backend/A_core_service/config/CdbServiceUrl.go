package config

import "fmt"

type CdnServiceURL struct {
	Base string
}

func (self *CdnServiceURL) FileBaseUrl(fileId int64) string {
	return self.Base + "/" + fmt.Sprint(fileId)
}

func (self *CdnServiceURL) ImageUrl(path string) string {
	return self.Base + "/" + path
}
