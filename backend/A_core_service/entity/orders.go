package entity

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type OrderStatus string

const (
	OrderStatusPending           OrderStatus = "Pending"
	OrderStatusPaid              OrderStatus = "Paid"
	OrderStatusCancelled         OrderStatus = "Cancelled"
	OrderStatusRefunded          OrderStatus = "Refunded"
	OrderStatusPartiallyRefunded OrderStatus = "PartiallyRefunded"
)

func (s OrderStatus) IsValid() bool {
	switch s {
	case OrderStatusPending, OrderStatusPaid, OrderStatusCancelled, OrderStatusRefunded, OrderStatusPartiallyRefunded:
		return true
	}
	return false
}

type Order struct {
	entitycommon.Model
	UpdatedAt   time.Time       `gorm:"type:timestamptz;not null;default:now()"`
	UserID      entitycommon.Id `gorm:"type:bigint;not null"`
	TotalAmount int32           `gorm:"not null"`
	Currency    string          `gorm:"type:varchar(5);not null"`
	Status      OrderStatus     `gorm:"type:OrderStatus;default:'Pending';not null"`
	PaidAt      *time.Time      `gorm:"type:timestamptz"`
	CancelledAt *time.Time      `gorm:"type:timestamptz"`

	// relations
	User      *User            `gorm:"foreignKey:UserID"`
	Items     []OrderItem      `gorm:"foreignKey:OrderID"`
	Payments  []Payment        `gorm:"foreignKey:OrderID"`
	GiftCodes []CourseGiftCode `gorm:"foreignKey:OrderID"`
}

func (Order) TableName() string {
	return "orders"
}

type OrderPreloadOptions struct {
	User  bool
	Items bool
	*OrderItemPreloadOptions
	Payments bool
	*PaymentPreloadOptions
	GiftCodes bool
	*CourseGiftCodePreloadOptions
}

func (p *OrderPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.User {
		query.Preload(prefix + "User")
	}
	if p.Items {
		query.Preload(prefix + "Items")
		if p.OrderItemPreloadOptions != nil {
			p.OrderItemPreloadOptions.Preload(query, prefix+"Items.")
		}
	}
	if p.Payments {
		query.Preload(prefix + "Payments")
		if p.PaymentPreloadOptions != nil {
			p.PaymentPreloadOptions.Preload(query, prefix+"Payments.")
		}
	}
	if p.GiftCodes {
		query.Preload(prefix + "GiftCodes")
		if p.CourseGiftCodePreloadOptions != nil {
			p.CourseGiftCodePreloadOptions.Preload(query, prefix+"GiftCodes.")
		}
	}
}
