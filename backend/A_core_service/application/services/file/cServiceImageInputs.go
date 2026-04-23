package file

import (
	"encoding/json"

	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
)

type CServiceProcessImageVariant string

const (
	CServiceProcessImageVariantEnumResolutions CServiceProcessImageVariant = "Resolutions"
	CServiceProcessImageVariantEnumError       CServiceProcessImageVariant = "Error"
)

type CServiceProcessImageInput struct {
	Variant CServiceProcessImageVariant `json:"variant"`
	Body    any                         `json:"body"`
}

type CServiceProcessImageResolutionVariant string

const (
	CServiceProcessImageResolutionVariantThumbnail CServiceProcessImageResolutionVariant = "thumbnail"
	CServiceProcessImageResolutionVariantSmall     CServiceProcessImageResolutionVariant = "small"
	CServiceProcessImageResolutionVariantLarge     CServiceProcessImageResolutionVariant = "large"
	CServiceProcessImageResolutionVariantNative    CServiceProcessImageResolutionVariant = "native"
)

type CServiceProcessImageVariantResolutions struct {
	Resolutions map[CServiceProcessImageResolutionVariant]CServiceProcessImageResolution `json:"resolutions"`
}

type CServiceProcessImageResolution struct {
	Width  int32  `json:"w"`
	Height int32  `json:"h"`
	Path   string `json:"path"`
}

type CServiceProcessImageVariantError struct {
	Error localerror.LocalError `json:"error"`
}

func (r *CServiceProcessImageInput) UnmarshalJSON(data []byte) error {
	var tmp struct {
		Variant CServiceProcessImageVariant `json:"variant"`
		Body    json.RawMessage             `json:"body"`
	}

	if err := json.Unmarshal(data, &tmp); err != nil {
		return global.Err(err)
	}

	r.Variant = tmp.Variant

	switch tmp.Variant {
	case CServiceProcessImageVariantEnumResolutions:
		var res CServiceProcessImageVariantResolutions
		if err := json.Unmarshal(tmp.Body, &res); err != nil {
			return global.Err(err)
		}
		r.Body = res

	case CServiceProcessImageVariantEnumError:
		var errBody CServiceProcessImageVariantError
		if err := json.Unmarshal(tmp.Body, &errBody); err != nil {
			return global.Err(err)
		}
		r.Body = errBody
	}

	return nil
}
