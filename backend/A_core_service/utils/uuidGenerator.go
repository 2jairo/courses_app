package utils

import (
	"strings"

	"github.com/google/uuid"
)

func GenerateUUID() string {
	u, _ := uuid.NewV7()
	return strings.ReplaceAll(u.String(), "-", "")
}
