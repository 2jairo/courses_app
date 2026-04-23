export const SHOPPING_CART_ITEM_DESTINATION = ["CurrentUser", "Gift"] as const
export type ShoppingCartItemDestination = typeof SHOPPING_CART_ITEM_DESTINATION[number];

export const MAX_SHOPPING_CART_ITEM_QUANTITY = 250