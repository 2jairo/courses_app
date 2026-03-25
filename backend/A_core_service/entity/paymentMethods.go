package entity

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/stripe/stripe-go/v84"
	"gorm.io/gorm"
)

type PaymentProvider string

const (
	PaymentProviderStripe PaymentProvider = "Stripe"
)

func (p PaymentProvider) IsValid() bool {
	return p == PaymentProviderStripe
}

type CardFunding string

const (
	CardFundingCredit  CardFunding = "credit"
	CardFundingDebit   CardFunding = "debit"
	CardFundingPrepaid CardFunding = "prepaid"
	CardFundingUnknown CardFunding = "unknown"
)

func (p CardFunding) IsValid() bool {
	return p == CardFundingCredit ||
		p == CardFundingDebit ||
		p == CardFundingPrepaid ||
		p == CardFundingUnknown
}

type CardBrand string

const (
	CardBrandAmex       CardBrand = "amex"
	CardBrandDiners     CardBrand = "diners"
	CardBrandDiscover   CardBrand = "discover"
	CardBrandJCB        CardBrand = "jcb"
	CardBrandMastercard CardBrand = "mastercard"
	CardBrandUnionpay   CardBrand = "unionpay"
	CardBrandUnknown    CardBrand = "unknown"
	CardBrandVisa       CardBrand = "visa"
)

func (p CardBrand) IsValid() bool {
	return p == CardBrandAmex ||
		p == CardBrandDiners ||
		p == CardBrandDiscover ||
		p == CardBrandJCB ||
		p == CardBrandMastercard ||
		p == CardBrandUnionpay ||
		p == CardBrandUnknown ||
		p == CardBrandVisa
}

type PaymentMethod struct {
	entitycommon.Model
	UpdatedAt      time.Time       `gorm:"type:timestamptz;not null;default:now()"`
	UserID         entitycommon.Id `gorm:"type:bigint;not null"`
	Provider       PaymentProvider `gorm:"type:PaymentProvider;not null"`
	MethodType     string          `gorm:"type:text;not null"` // Stripe payment method type, such as card, paypal, or sepa_debit.
	Token          string          `gorm:"type:text;not null"` // Stripe -> payment_method_id
	LastFour       *string         `gorm:"type:varchar(4)"`
	ExpiryMonth    *int16          `gorm:"type:smallint"`
	ExpiryYear     *int16          `gorm:"type:smallint"`
	CardholderName *string         `gorm:"type:varchar(100)"`
	CardBrand      *CardBrand      `gorm:"type:CardBrand"`
	CardFunding    *CardFunding    `gorm:"type:CardFunding"`
	Email          *string         `gorm:"type:varchar(255)"`
	BankName       *string         `gorm:"type:varchar(100)"` // For bank-based methods (SEPA, BACS, US Bank Account, AU BECS)
	BankCode       *string         `gorm:"type:varchar(20)"`  // BSB, sort code, bank code
	AccountType    *string         `gorm:"type:varchar(20)"`  // "checking", "savings" for US bank accounts
	Country        *string         `gorm:"type:char(2)"`      // ISO country code (For methods that have a country (PayPal, SEPA, iDEAL, etc.))
	IsDefault      bool            `gorm:"default:false"`
	// relations
	User *User `gorm:"foreignKey:UserID"`
}

func PaymentMethodFromStripe(
	stripePM *stripe.PaymentMethod,
	userID entitycommon.Id,
	isDefault bool,
) *PaymentMethod {
	var last4 *string
	var expMonth *int16
	var expYear *int16
	var funding *CardFunding
	var brand *CardBrand
	var cardholderName *string
	var email *string
	var bankName *string
	var bankCode *string
	var accountType *string
	var country *string

	// Extract fields based on the payment method type
	switch stripePM.Type {
	case stripe.PaymentMethodTypeCard:
		if stripePM.Card != nil {
			last4 = stripe.String(stripePM.Card.Last4)
			expMonth = utils.Ref(int16(stripePM.Card.ExpMonth))
			expYear = utils.Ref(int16(stripePM.Card.ExpYear))

			brandPtr := CardBrand(string(stripePM.Card.Brand))
			if brandPtr.IsValid() {
				brand = &brandPtr
			} else {
				unknown := CardBrandUnknown
				brand = &unknown
			}

			// Map Stripe funding to our CardFunding type
			fundingStr := string(stripePM.Card.Funding)
			fundingPtr := CardFunding(fundingStr)
			if fundingPtr.IsValid() {
				funding = &fundingPtr
			} else {
				unknown := CardFundingUnknown
				funding = &unknown
			}
		}

	case stripe.PaymentMethodTypePaypal:
		if stripePM.Paypal != nil {
			email = stripe.String(stripePM.Paypal.PayerEmail)
			country = stripe.String(stripePM.Paypal.Country)
			// You might also store PayerID if needed, but it's not typically displayed
		}

	case stripe.PaymentMethodTypeSEPADebit:
		if stripePM.SEPADebit != nil {
			last4 = stripe.String(stripePM.SEPADebit.Last4)
			bankCode = stripe.String(stripePM.SEPADebit.BankCode)
			country = stripe.String(stripePM.SEPADebit.Country)
			// Bank name may not be directly available; you could add a lookup if needed
		}

	case stripe.PaymentMethodTypeBACSDebit:
		if stripePM.BACSDebit != nil {
			last4 = stripe.String(stripePM.BACSDebit.Last4)
			bankCode = stripe.String(stripePM.BACSDebit.SortCode) // Sort code is the bank code
			// BACS doesn't have a separate bank name in the API
		}

	case stripe.PaymentMethodTypeUSBankAccount:
		if stripePM.USBankAccount != nil {
			last4 = stripe.String(stripePM.USBankAccount.Last4)
			bankName = stripe.String(stripePM.USBankAccount.BankName)
			accountType = stripe.String(string(stripePM.USBankAccount.AccountType))
			// Routing number could be stored if needed, but not typical for display
		}

	case stripe.PaymentMethodTypeAUBECSDebit:
		if stripePM.AUBECSDebit != nil {
			last4 = stripe.String(stripePM.AUBECSDebit.Last4)
			bankCode = stripe.String(stripePM.AUBECSDebit.BSBNumber)
			// AU BECS doesn't provide a bank name directly
		}

	case stripe.PaymentMethodTypeLink:
		if stripePM.Link != nil {
			email = stripe.String(stripePM.Link.Email)
		}

	case stripe.PaymentMethodTypeKlarna:
		// Klarna is usually shown by its logo; no standard display fields
		// You could optionally store the DOB if needed, but it's rarely displayed
		break

	case stripe.PaymentMethodTypeIDEAL:
		if stripePM.IDEAL != nil {
			bankCode = stripe.String(stripePM.IDEAL.Bank) // Bank name/code
			country = stripe.String("NL")                 // iDEAL is only available in the Netherlands
		}

	case stripe.PaymentMethodTypeEPS:
		if stripePM.EPS != nil {
			bankCode = stripe.String(stripePM.EPS.Bank)
			country = stripe.String("AT")
		}

	case stripe.PaymentMethodTypeFPX:
		if stripePM.FPX != nil {
			bankCode = stripe.String(stripePM.FPX.Bank)
			country = stripe.String("MY")
		}

	case stripe.PaymentMethodTypeGrabpay:
		// No standard display fields, just the logo
		break
	}

	// Billing details: cardholder name is common across many types
	if stripePM.BillingDetails != nil && stripePM.BillingDetails.Name != "" {
		cardholderName = stripe.String(stripePM.BillingDetails.Name)
		// If email wasn't set by the payment method type, try from billing details
		if email == nil && stripePM.BillingDetails.Email != "" {
			email = stripe.String(stripePM.BillingDetails.Email)
		}
	}

	// Build and return the PaymentMethod
	return &PaymentMethod{
		UserID:         userID,
		Provider:       PaymentProviderStripe,
		MethodType:     string(stripePM.Type),
		Token:          stripePM.ID,
		LastFour:       last4,
		ExpiryMonth:    expMonth,
		ExpiryYear:     expYear,
		CardholderName: cardholderName,
		CardBrand:      brand,
		CardFunding:    funding,
		IsDefault:      isDefault,
		Email:          email,
		BankName:       bankName,
		BankCode:       bankCode,
		AccountType:    accountType,
		Country:        country,
	}
}

func (PaymentMethod) TableName() string {
	return "payment_methods"
}

type PaymentMethodPreloadOptions struct {
	User bool
}

func (p *PaymentMethodPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.User {
		query.Preload(prefix + "User")
	}
}
