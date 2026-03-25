package entity

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type PaymentStatus string

const (
	PaymentStatusPending           PaymentStatus = "Pending"
	PaymentStatusSucceeded         PaymentStatus = "Succeeded"
	PaymentStatusFailed            PaymentStatus = "Failed"
	PaymentStatusRefunded          PaymentStatus = "Refunded"
	PaymentStatusPartiallyRefunded PaymentStatus = "PartiallyRefunded"
)

func (s PaymentStatus) IsValid() bool {
	switch s {
	case PaymentStatusPending, PaymentStatusSucceeded, PaymentStatusFailed, PaymentStatusRefunded, PaymentStatusPartiallyRefunded:
		return true
	}
	return false
}

type Payment struct {
	entitycommon.Model
	UpdatedAt             time.Time        `gorm:"type:timestamptz;not null;default:now()"`
	OrderID               entitycommon.Id  `gorm:"type:bigint;not null"`
	PaymentMethodID       *entitycommon.Id `gorm:"type:bigint"`
	Provider              PaymentProvider  `gorm:"type:PaymentProvider;not null"`
	ProviderTransactionID *string          `gorm:"type:varchar(255)"`
	Amount                int32            `gorm:"not null"`
	Currency              string           `gorm:"type:varchar(5);not null"`
	Status                PaymentStatus    `gorm:"type:PaymentStatus;default:'Pending';not null"`
	ErrorMessage          *string          `gorm:"type:text"`
	RefundedAmount        int32            `gorm:"not null;default:0"`

	// relations
	Order         *Order         `gorm:"foreignKey:OrderID"`
	PaymentMethod *PaymentMethod `gorm:"foreignKey:PaymentMethodID"`
}

func (Payment) TableName() string {
	return "payments"
}

type PaymentPreloadOptions struct {
	Order         bool
	PaymentMethod bool
}

func (p *PaymentPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.Order {
		query.Preload(prefix + "Order")
	}
	if p.PaymentMethod {
		query.Preload(prefix + "PaymentMethod")
	}
}
