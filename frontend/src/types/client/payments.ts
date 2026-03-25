// REQUEST

import type { PaymentIntent } from "@stripe/stripe-js"

export interface CreatePaymentIntentRequest {
  paymentMethodId?: number
  savePaymentMethod: boolean
}

// RESPONSE

export interface CreatePaymentIntentResponse {
  clientSecret: string
  status: PaymentIntent.Status
}