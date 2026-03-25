package entity

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type OrderItem struct {
	entitycommon.Model
	OrderID     entitycommon.Id             `gorm:"type:bigint;not null"`
	CourseID    entitycommon.Id             `gorm:"type:bigint;not null"`
	Quantity    int32                       `gorm:"not null;default:1"`
	Destination ShoppingCartItemDestination `gorm:"type:ShoppingCartItemDestination;default:'CurrentUser';primaryKey"`
	UnitPrice   int32                       `gorm:"not null"`
	TotalPrice  int32                       `gorm:"not null"`

	// relations
	Order  *Order  `gorm:"foreignKey:OrderID"`
	Course *Course `gorm:"foreignKey:CourseID"`
}

func (OrderItem) TableName() string {
	return "order_items"
}

type OrderItemPreloadOptions struct {
	Order  bool
	Course bool
	CoursePreloadOptions
}

func (p *OrderItemPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.Order {
		query.Preload(prefix + "Order")
	}
	if p.Course {
		query.Preload(prefix + "Course")
		p.CoursePreloadOptions.Preload(query, prefix+"Course.")
	}
}
