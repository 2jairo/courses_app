export const SHOPPING_CART_ITEM_DESTINATION = ["CurrentUser", "Gift"] as const
export type ShoppingCartItemDestination = typeof SHOPPING_CART_ITEM_DESTINATION[number];
