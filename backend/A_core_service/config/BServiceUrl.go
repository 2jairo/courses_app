package config

import (
	"fmt"
)

type BServiceURL struct {
	Base string
}

func (bs *BServiceURL) AuthClaims() string {
	return fmt.Sprintf("%s/auth/claims", bs.Base)
}
