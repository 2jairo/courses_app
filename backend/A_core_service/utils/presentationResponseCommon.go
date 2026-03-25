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

type PriceDiscountCurrency struct {
	Price           int32  `json:"price"`
	DiscountPercent int32  `json:"discountPercent"`
	Currency        string `json:"currency"`
	IsFree          bool   `json:"isFree"`
}
