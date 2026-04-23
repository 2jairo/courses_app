package utils

import (
	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/ipinfo/go/v2/ipinfo"
)

func NewIpInfo() *ipinfo.Client {
	return ipinfo.NewClient(nil, nil, config.IpInfoIoToken)
}
