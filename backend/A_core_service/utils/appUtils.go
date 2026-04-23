package utils

import (
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/ipinfo/go/v2/ipinfo"
)

type AppUtils struct {
	S2SJwt    S2SJwt
	Validator Validator
	IpInfo    *ipinfo.Client
}

func NewAppUtils() *AppUtils {
	return &AppUtils{
		S2SJwt:    NewS2SJwt(),
		Validator: NewValidator(),
		IpInfo:    NewIpInfo(),
	}
}

func (self *AppUtils) DefaultBind(value interface{}, parser func(i interface{}) error) error {
	if err := parser(value); err != nil {
		return global.Err(err)
	}
	if err := self.Validator.Validate(value); err != nil {
		return global.Err(err)
	}

	return nil
}
