package config

import (
	"fmt"
)

type GatewayIASearchURL struct {
	Base string
}

func (bs *GatewayIASearchURL) Genreate() string {
	return fmt.Sprintf("%s/generate", bs.Base)
}
