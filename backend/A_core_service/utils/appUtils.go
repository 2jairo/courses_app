package utils

type AppUtils struct {
	S2SJwt    S2SJwt
	Validator Validator
}

func NewAppUtils() *AppUtils {
	return &AppUtils{
		S2SJwt:    NewS2SJwt(),
		Validator: NewValidator(),
	}
}

func (self *AppUtils) DefaultBind(value interface{}, parser func(i interface{}) error) error {
	if err := parser(value); err != nil {
		return err
	}
	if err := self.Validator.Validate(value); err != nil {
		return err
	}

	return nil
}
