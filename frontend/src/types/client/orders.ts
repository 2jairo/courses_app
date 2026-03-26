import type { OrderStatus } from "../common/orders"
import type { PaymentMethodProviders } from "../common/paymentMethods"
import type { PaymentStatus } from "../common/payments"
import type { ShoppingCartItemDestination } from "../common/shoppingCart"
import type { PaymentMethodResponse } from "./paymentMethods"


// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetOrdersRequest {}


// RESPONSE
export interface OrderResponse {
  id: number
  createdAt: string
  updatedAt: string
  totalAmount: number
  currency: string
  status: OrderStatus
  paidAt: string | null
  cancelledAt: string | null
  items: OrderItemResponse[]
  payments: OrderPaymentResponse[]
}

export interface OrderItemResponse {
  id: number
  quantity: number
  unitPrice: number
  discountPercentPerUnit: number
  totalPrice: number
  destination: ShoppingCartItemDestination
  course: OrderItemCourseResponse
}

export interface OrderItemCourseResponse {
  id: number
  title: string
  slug: string
  description: string
  price: number
  poster: string
}

export interface OrderPaymentResponse {
  updatedAt: string
  paymentMethod?: PaymentMethodResponse | null
  provider: PaymentMethodProviders
  amount: number
  currency: string
  status: PaymentStatus
  errorMessage?: string | null
  refundedAmount: number
}