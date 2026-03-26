package coursegiftcodes

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type CourseGiftCodesService struct {
	Repo *infrastructure.AppRepositories
}

func (s *CourseGiftCodesService) GetOrderItemGiftCodes(input GetOrderItemGiftCodesInput) ([]entity.CourseGiftCode, error) {
	order := &entity.Order{Model: entitycommon.Model{ID: input.OrderID}}
	if err := s.Repo.Order.FindOne(order, entity.OrderPreloadOptions{}); err != nil {
		return nil, err
	}
	if order.UserID != input.UserID {
		return nil, &localerror.LocalError{Err: localerror.ErrKindForbidden, Status: fiber.StatusForbidden}
	}

	giftCodes, err := s.Repo.CourseGiftCode.Find(
		&entity.CourseGiftCode{OrderID: input.OrderID, CourseID: input.CourseID},
		entity.CourseGiftCodePreloadOptions{
			Course:       true,
			RedeemedUser: true,
		},
		nil,
	)
	if err != nil {
		return nil, err
	}

	return giftCodes, nil
}

func (s *CourseGiftCodesService) RedeemGiftCode(input RedeemGiftCodeInput) (*entity.CourseGiftCode, error) {
	giftCode, err := s.Repo.BeginPgTxCallback(func(repo *infrastructure.AppRepositories) (any, error) {
		giftCode := &entity.CourseGiftCode{Code: input.Code}
		if err := s.Repo.CourseGiftCode.FindOne(giftCode, entity.CourseGiftCodePreloadOptions{}); err != nil {
			return nil, err
		}

		// Check if already redeemed
		if giftCode.RedeemedAt != nil {
			return nil, &localerror.LocalError{Err: localerror.ErrKindAlredyRedeemed, Status: fiber.StatusConflict}
		}

		// check if alredy purchased
		coursePurchase := &entity.CoursePurchase{
			UserID:   input.UserID,
			CourseID: giftCode.CourseID,
		}
		if err := s.Repo.CoursePurchase.FindOne(
			coursePurchase,
			entity.CoursePurchasePreloadOptions{},
		); err == nil {
			return nil, &localerror.LocalError{Err: localerror.ErrKindAlredyPurchased, Status: fiber.StatusConflict}
		}

		if err := s.Repo.CoursePurchase.Create(coursePurchase); err != nil {
			return nil, err
		}

		// Update gift code with redemption info
		updated := &entity.CourseGiftCode{RedeemedAt: utils.Ref(time.Now()), RedeemedBy: &input.UserID}
		if err := s.Repo.CourseGiftCode.Update(&entity.CourseGiftCode{Code: input.Code}, updated); err != nil {
			return nil, err
		}

		course := &entity.Course{Model: entitycommon.Model{ID: updated.CourseID}}
		if err := s.Repo.Course.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
			return nil, err
		}

		giftCode.Course = course
		return giftCode, nil
	})

	if err != nil {
		return nil, err
	}

	return giftCode.(*entity.CourseGiftCode), nil
}
