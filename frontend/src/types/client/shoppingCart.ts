import type { Currency, PriceDiscountCurrency } from "../common/price"
import type { ShoppingCartItemDestination } from "../common/shoppingCart"

// REQUEST
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetShoppingCartRequest {
  
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ClearShoppingCartRequest {

}

export interface UpdateShoppingCartRequest {
  items: UpdateShoppingCartItemRequest[]
}

export interface UpdateShoppingCartItemRequest {
  courseId: number
  quantity: number
  destination: ShoppingCartItemDestination
}

// RESPONSE
export interface ShoppingCartResponse {
  items: ShoppingCartItemResponse[]
  total: number
  totalDiscounted: number
  currency: Currency
}

export interface ShoppingCartItemResponse {
  quantity: number
  destination: ShoppingCartItemDestination
  course: ShoppingCartItemCourseResponse
}

export type ShoppingCartItemCourseResponse = {
  id: number
  slug: string
  title: string
  poster?: string
} & PriceDiscountCurrency