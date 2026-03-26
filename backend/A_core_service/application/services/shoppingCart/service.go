package shoppingcart

import (
	"errors"
	"sort"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type ShoppingCartService struct {
	Repo *infrastructure.AppRepositories
}

func (s *ShoppingCartService) GetShoppingCart(input GetShoppingCartInput) (*entity.ShoppingCart, error) {
	cart := &entity.ShoppingCart{
		UserID: input.UserID,
	}
	preloadOptions := entity.ShoppingCartPreloadOptions{
		Items: true,
		ShoppingCartItemPreloadOptions: entity.ShoppingCartItemPreloadOptions{
			Course: true,
		},
	}

	err := s.Repo.ShoppingCart.FindOne(cart, preloadOptions)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			err = s.Repo.ShoppingCart.Create(cart)
			return cart, err
		}
		return nil, err
	}

	sort.Slice(cart.Items, func(i, j int) bool {
		return cart.Items[i].CreatedAt.Before(cart.Items[j].CreatedAt)
	})

	return cart, nil
}

func (s *ShoppingCartService) ClearShoppingCart(input ClearShoppingCartInput) error {
	cart, err := s.GetShoppingCart(GetShoppingCartInput{UserID: input.UserID})
	if err != nil {
		return err
	}

	return s.Repo.ShoppingCartItem.Delete(&entity.ShoppingCartItem{ShoppingCartID: cart.ID})
}

func (s *ShoppingCartService) UpdateShoppingCart(input UpdateShoppingCartInput) (*entity.ShoppingCart, error) {
	cart, err := s.GetShoppingCart(GetShoppingCartInput{UserID: input.UserID})
	if err != nil {
		return nil, err
	}

	for _, item := range input.Items {
		course := &entity.Course{Model: entitycommon.Model{ID: item.CourseID}}
		if err := s.Repo.Course.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
			return nil, err
		}
		if course.DiscountedPrice() == 0 {
			return nil, &localerror.LocalError{Err: localerror.ErrKindIsFree, Status: fiber.StatusForbidden}
		}

		if item.Destination == entity.ShoppingCartItemDestinationCurrentUser {
			purchaseErr := s.Repo.CoursePurchase.FindOne(
				&entity.CoursePurchase{UserID: input.UserID, CourseID: course.ID},
				entity.CoursePurchasePreloadOptions{},
			)
			if purchaseErr == nil || !errors.Is(gorm.ErrRecordNotFound, purchaseErr) {
				return nil, &localerror.LocalError{Err: localerror.ErrKindAlredyPurchased, Status: fiber.StatusForbidden}
			}
		}

		if item.Quantity <= 0 {
			itemEntity := &entity.ShoppingCartItem{
				ShoppingCartID: cart.ID,
				CourseID:       item.CourseID,
				Destination:    item.Destination,
			}

			err := s.Repo.ShoppingCartItem.Delete(itemEntity)
			if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, err
			}
		} else {
			quantity := item.Quantity
			if item.Destination == entity.ShoppingCartItemDestinationCurrentUser {
				quantity = 1
			}

			itemEntity := &entity.ShoppingCartItem{
				ShoppingCartID: cart.ID,
				CourseID:       item.CourseID,
				Quantity:       quantity,
				Destination:    item.Destination,
			}

			if err := s.Repo.ShoppingCartItem.Create(itemEntity); err != nil {
				return nil, err
			}
		}
	}

	return s.GetShoppingCart(GetShoppingCartInput{UserID: input.UserID})
}
