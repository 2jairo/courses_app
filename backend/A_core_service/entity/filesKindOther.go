package entity

import "github.com/2jairo/courses_app/backend/A_core_service/localerror"

// Metadata other
type FileMetadataKindPath struct {
	Path  string                 `json:"path"`
	Error *localerror.LocalError `json:"error,omitempty"`
}
