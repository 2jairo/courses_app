package utils

import (
	"reflect"
	"strings"

	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type Validator struct {
	validator *validator.Validate
}

func NewValidator() Validator {
	v := validator.New()
	v.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := fld.Tag.Get("json")

		if name == "-" || name == "" {
			return fld.Name
		}

		// remove omitempty, etc.
		return strings.Split(name, ",")[0]
	})

	v.RegisterValidation("enum", func(fl validator.FieldLevel) bool {
		field := fl.Field()

		// Check if the field implements Enum interface
		if enum, ok := field.Interface().(ValidatorEnum); ok {
			return enum.IsValid()
		}
		return false
	})

	return Validator{
		validator: v,
	}
}

func (v *Validator) Validate(i interface{}) error {
	if err := v.validator.Struct(i); err != nil {
		return err
	}

	if value, ok := i.(interface{ HasAtLeastOneField() bool }); ok {
		if !value.HasAtLeastOneField() {
			return &localerror.LocalError{
				Err:    localerror.ErrKindJsonRejection,
				Status: fiber.StatusBadRequest,
				Msg:    "at least one field must be provided",
			}
		}
	}

	return nil
}
