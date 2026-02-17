package utils

import (
	"encoding/base64"

	"github.com/google/uuid"
)

func GenerateUUID() string {
	u, _ := uuid.NewV7()
	return base64.RawURLEncoding.EncodeToString(u[:])
}
