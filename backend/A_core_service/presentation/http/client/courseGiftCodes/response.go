package coursegiftcodes

import (
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type CourseGiftCodeResponse struct {
	Code       string              `json:"code"`
	RedeemedAt *time.Time          `json:"redeemedAt,omitempty"`
	RedeemedBy *utils.UserResponse `json:"redeemedBy,omitempty"`
}

type RedeemGiftCodeResponse struct {
	Course RedeemGiftCodeResponseCourse `json:"course"`
}
type RedeemGiftCodeResponseCourse struct {
	Slug   string  `json:"slug"`
	Title  string  `json:"title"`
	Poster *string `json:"poster"`
}

func getGiftCodeResponse(giftCode *entity.CourseGiftCode) CourseGiftCodeResponse {
	var redeemedBy *utils.UserResponse = nil
	if giftCode.RedeemedUser != nil {
		var avatar *string = nil
		if giftCode.RedeemedUser.Avatar != nil {
			avatar = utils.Ref(giftCode.RedeemedUser.Avatar.CdnImageUrl())
		}

		redeemedBy = &utils.UserResponse{
			Username: giftCode.RedeemedUser.Username,
			Avatar:   avatar,
		}
	}

	return CourseGiftCodeResponse{
		Code:       giftCode.Code,
		RedeemedAt: giftCode.RedeemedAt,
		RedeemedBy: redeemedBy,
	}
}

func (self *RedeemGiftCodeRequest) getResponse(giftCode *entity.CourseGiftCode) *RedeemGiftCodeResponse {
	var poster *string = nil
	if giftCode.Course.Poster != nil {
		poster = utils.Ref(giftCode.Course.Poster.CdnImageUrl())
	}

	return &RedeemGiftCodeResponse{
		Course: RedeemGiftCodeResponseCourse{
			Slug:   giftCode.Course.Slug.Slug,
			Title:  giftCode.Course.Title,
			Poster: poster,
		},
	}
}

func (self *GetOrderItemGiftCodesRequest) getResponse(giftCodes []entity.CourseGiftCode) []CourseGiftCodeResponse {
	responses := make([]CourseGiftCodeResponse, len(giftCodes))

	for i, giftCode := range giftCodes {
		responses[i] = getGiftCodeResponse(&giftCode)
	}

	return responses
}
