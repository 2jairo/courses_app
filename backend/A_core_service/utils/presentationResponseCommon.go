package utils

type CdnResponse struct {
	Base  string  `json:"base"`
	Token *string `json:"token,omitempty"`
}
