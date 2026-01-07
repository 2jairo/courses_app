package utils

import "github.com/google/uuid"

type ClientJwtClaims struct {
	UserId  int64     `json:"user_id"`
	Version uuid.UUID `json:"version"`
}
