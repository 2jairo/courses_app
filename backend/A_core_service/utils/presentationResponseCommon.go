package utils

type CdnResponse struct {
	Base  string `json:"base"`
	Token string `json:"token,omitempty"`
}

type UserResponse struct {
	Username string  `json:"username"`
	Avatar   *string `json:"avatar"`
	ID       int64   `json:"id,omitempty"`
}
