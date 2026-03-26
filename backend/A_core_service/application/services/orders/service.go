package orders

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
)

type OrdersService struct {
	Repo *infrastructure.AppRepositories
}

func (s *OrdersService) GetUserOrders(input GetUserOrdersInput) ([]entity.Order, error) {
	return s.Repo.Order.Find(
		&entity.Order{UserID: input.UserId},
		entity.OrderPreloadOptions{
			Items: true,
			OrderItemPreloadOptions: &entity.OrderItemPreloadOptions{
				Course: true,
			},
			Payments: true,
			PaymentPreloadOptions: &entity.PaymentPreloadOptions{
				PaymentMethod: true,
			},
		},
		input.Pagination,
	)
}
