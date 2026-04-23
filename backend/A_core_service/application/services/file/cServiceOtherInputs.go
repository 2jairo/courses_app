package file

import (
	"encoding/json"

	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
)

type CServiceProcessOtherVariant string

const (
	CServiceProcessOtherVariantEnumOk    CServiceProcessOtherVariant = "Ok"
	CServiceProcessOtherVariantEnumError CServiceProcessOtherVariant = "Error"
)

type CServiceProcessOtherInput struct {
	Variant CServiceProcessOtherVariant `json:"variant"`
	Body    any                         `json:"body"`
}

type CServiceProcessOtherVariantOk struct {
	Path string `json:"path"`
}

type CServiceProcessOtherVariantError struct {
	Error localerror.LocalError `json:"error"`
}

func (r *CServiceProcessOtherInput) UnmarshalJSON(data []byte) error {
	// Step 1: unmarshal into a temp struct with RawMessage
	var tmp struct {
		Variant CServiceProcessOtherVariant `json:"variant"`
		Body    json.RawMessage             `json:"body"`
	}
	if err := json.Unmarshal(data, &tmp); err != nil {
		return global.Err(err)
	}

	r.Variant = tmp.Variant

	// Step 2: unmarshal Body into the correct concrete type
	switch tmp.Variant {
	case CServiceProcessOtherVariantEnumOk:
		var ok CServiceProcessOtherVariantOk
		if err := json.Unmarshal(tmp.Body, &ok); err != nil {
			return global.Err(err)
		}
		r.Body = ok

	case CServiceProcessOtherVariantEnumError:
		var errBody CServiceProcessOtherVariantError
		if err := json.Unmarshal(tmp.Body, &errBody); err != nil {
			return global.Err(err)
		}
		r.Body = errBody
	}

	return nil
}
