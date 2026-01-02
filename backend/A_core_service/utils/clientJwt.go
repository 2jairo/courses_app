package utils

import "github.com/google/uuid"

type ClientJwtClaims struct {
	UserId  uuid.UUID `json:"user_id"`
	Version uuid.UUID `json:"version"`
}
