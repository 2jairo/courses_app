package entity

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type ShoppingCartItemDestination string

const (
	ShoppingCartItemDestinationCurrentUser ShoppingCartItemDestination = "CurrentUser"
	ShoppingCartItemDestinationGift        ShoppingCartItemDestination = "Gift"
)

func (d ShoppingCartItemDestination) IsValid() bool {
	return d == ShoppingCartItemDestinationCurrentUser || d == ShoppingCartItemDestinationGift
}

type ShoppingCartItem struct {
	CreatedAt time.Time      `gorm:"type:timestamptz;not null;default:now()"`
	DeletedAt gorm.DeletedAt `gorm:"type:timestamptz"`

	ShoppingCartID entitycommon.Id             `gorm:"type:bigint;primaryKey"`
	CourseID       entitycommon.Id             `gorm:"type:bigint;primaryKey"`
	Quantity       int32                       `gorm:"not null"`
	Destination    ShoppingCartItemDestination `gorm:"type:ShoppingCartItemDestination;default:'CurrentUser';primaryKey"`

	// relations
	ShoppingCart *ShoppingCart `gorm:"foreignKey:ShoppingCartID"`
	Course       *Course       `gorm:"foreignKey:CourseID"`
}

func (ShoppingCartItem) TableName() string {
	return "shopping_cart_items"
}

type ShoppingCartItemPreloadOptions struct {
	ShoppingCart bool
	Course       bool
	CoursePreloadOptions
}

func (p *ShoppingCartItemPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.ShoppingCart {
		query.Preload(prefix + "ShoppingCart")
	}
	if p.Course {
		query.Preload(prefix + "Course")
		p.CoursePreloadOptions.Preload(query, prefix+"Course.")
	}
}
