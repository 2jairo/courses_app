package shoppingcart

import (
	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type ShoppingCartResponse struct {
	Items           []ShoppingCartItemResponse `json:"items"`
	Currency        string                     `json:"currency"`
	Total           int32                      `json:"total"`
	TotalDiscounted int32                      `json:"totalDiscounted"`
}
type ShoppingCartItemResponse struct {
	Quantity    int32                              `json:"quantity"`
	Destination entity.ShoppingCartItemDestination `json:"destination"`
	Course      ShoppingCartItemCourseResponse     `json:"course"`
}
type ShoppingCartItemCourseResponse struct {
	Id int64 `json:"id"`
	utils.PriceDiscountCurrency
	Slug   string  `json:"slug"`
	Title  string  `json:"title"`
	Poster *string `json:"poster"`
}

func getShoppingCartResponse(
	cart *entity.ShoppingCart,
) *ShoppingCartResponse {
	items := make([]ShoppingCartItemResponse, len(cart.Items))
	total := int32(0)
	totalDiscounted := int32(0)

	for i, item := range cart.Items {
		total += item.Course.Price * item.Quantity
		totalDiscounted += item.Course.DiscountedPrice() * item.Quantity

		var poster *string = nil
		if item.Course.Poster != nil {
			path := item.Course.Poster.CdnImageUrl()
			poster = &path
		}

		items[i] = ShoppingCartItemResponse{
			Quantity:    item.Quantity,
			Destination: item.Destination,
			Course: ShoppingCartItemCourseResponse{
				Id: int64(item.Course.ID),
				PriceDiscountCurrency: utils.PriceDiscountCurrency{
					Price:           item.Course.Price,
					Currency:        config.TmpCurrency,
					DiscountPercent: item.Course.DiscountPercent,
					IsFree:          item.Course.DiscountedPrice() == 0,
				},
				Slug:   item.Course.Slug.Slug,
				Title:  item.Course.Title,
				Poster: poster,
			},
		}
	}

	return &ShoppingCartResponse{
		Items:           items,
		Currency:        config.TmpCurrency,
		Total:           total,
		TotalDiscounted: totalDiscounted,
	}
}

func (self *GetShoppingCartRequest) getResponse(cart *entity.ShoppingCart) *ShoppingCartResponse {
	return getShoppingCartResponse(cart)
}

func (self *UpdateShoppingCartRequest) getResponse(cart *entity.ShoppingCart) *ShoppingCartResponse {
	return getShoppingCartResponse(cart)
}
