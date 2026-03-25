// REQUEST

import type { PaymentIntent } from "@stripe/stripe-js"

export interface CreatePaymentIntentRequest {
  paymentMethodId?: string
  savePaymentMethod: boolean
}

// RESPONSE

export interface CreatePaymentIntentResponse {
  clientSecret: string
  status: PaymentIntent.Status
}