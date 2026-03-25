package entity

import (
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type ShoppingCart struct {
	entitycommon.Model
	UserID entitycommon.Id `gorm:"type:bigint;not null"`

	// relations
	User  *User              `gorm:"foreignKey:UserID"`
	Items []ShoppingCartItem `gorm:"foreignKey:ShoppingCartID"`
}

func (ShoppingCart) TableName() string {
	return "shopping_carts"
}

type ShoppingCartPreloadOptions struct {
	User  bool
	Items bool
	ShoppingCartItemPreloadOptions
}

func (p *ShoppingCartPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.User {
		query.Preload(prefix + "User")
	}
	if p.Items {
		query.Preload(prefix + "Items")
		p.ShoppingCartItemPreloadOptions.Preload(query, prefix+"Items.")
	}
}
