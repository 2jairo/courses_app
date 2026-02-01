package cservicevideo

import (
	"encoding/json"

	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
)

// video request
type CServiceProcessVideoRequest struct {
	UserId   int64  `json:"user_id"`
	CourseId int64  `json:"course_id"`
	FileId   int64  `json:"file_id"`
	FileSize int64  `json:"file_size"`
	FilePath string `json:"file_path"`
}

// video response
type CServiceProcessVideoVariant string

const (
	CServiceProcessVideoVariantEnumInfo         CServiceProcessVideoVariant = "Info"
	CServiceProcessVideoVariantEnumResolutions  CServiceProcessVideoVariant = "Resolutions"
	CServiceProcessVideoVariantEnumPoster       CServiceProcessVideoVariant = "Poster"
	CServiceProcessVideoVariantEnumThumbnails   CServiceProcessVideoVariant = "Thumbnails"
	CServiceProcessVideoVariantEnumSpeechToText CServiceProcessVideoVariant = "SpeechToText"
	CServiceProcessVideoVariantEnumError        CServiceProcessVideoVariant = "Error"
)

type CServiceProcessVideoResponse struct {
	Variant CServiceProcessVideoVariant `json:"variant"`
	Body    any                         `json:"body"`
}

type CServiceProcessVideoVariantInfo struct {
	Duration float32 `json:"duration"`
}

type CServiceProcessVideoVariantResolutions struct {
	ResolutionsFramerate [][]int32 `json:"resolutions_framerate"`
	MediaPlaylist        string    `json:"media_playlist"`
}

type CServiceProcessVideoVariantPoster struct {
	Path string `json:"path"`
}

type CServiceProcessVideoVariantThumbnails struct {
	Path string `json:"path"`
}

type CServiceProcessVideoVariantSpeechToTextLanguages struct {
	Native   bool   `json:"native"`
	Language string `json:"language"`
	Path     string `json:"path"`
}

type CServiceProcessVideoVariantSpeechToText struct {
	Languages []CServiceProcessVideoVariantSpeechToTextLanguages `json:"languages"`
}

type CServiceProcessVideoVariantError struct {
	Error localerror.LocalError `json:"error"`
}

func (r *CServiceProcessVideoResponse) UnmarshalJSON(data []byte) error {
	// Step 1: unmarshal into a temp struct with RawMessage
	var tmp struct {
		Variant CServiceProcessVideoVariant `json:"variant"`
		Body    json.RawMessage             `json:"body"`
	}
	if err := json.Unmarshal(data, &tmp); err != nil {
		return err
	}

	r.Variant = tmp.Variant

	// Step 2: unmarshal Body into the correct concrete type
	switch tmp.Variant {
	case CServiceProcessVideoVariantEnumInfo:
		var info CServiceProcessVideoVariantInfo
		if err := json.Unmarshal(tmp.Body, &info); err != nil {
			return err
		}
		r.Body = info

	case CServiceProcessVideoVariantEnumResolutions:
		var res CServiceProcessVideoVariantResolutions
		if err := json.Unmarshal(tmp.Body, &res); err != nil {
			return err
		}
		r.Body = res

	case CServiceProcessVideoVariantEnumPoster:
		var poster CServiceProcessVideoVariantPoster
		if err := json.Unmarshal(tmp.Body, &poster); err != nil {
			return err
		}
		r.Body = poster

	case CServiceProcessVideoVariantEnumThumbnails:
		var thumb CServiceProcessVideoVariantThumbnails
		if err := json.Unmarshal(tmp.Body, &thumb); err != nil {
			return err
		}
		r.Body = thumb

	case CServiceProcessVideoVariantEnumSpeechToText:
		var stt CServiceProcessVideoVariantSpeechToText
		if err := json.Unmarshal(tmp.Body, &stt); err != nil {
			return err
		}
		r.Body = stt

	case CServiceProcessVideoVariantEnumError:
		var errBody CServiceProcessVideoVariantError
		if err := json.Unmarshal(tmp.Body, &errBody); err != nil {
			return err
		}
		r.Body = errBody
	}

	return nil
}
