// REQUEST

import type { PaymentIntent } from "@stripe/stripe-js"

export interface CreatePaymentIntentRequest {
  paymentMethodId?: number
  savePaymentMethod: boolean
}

export interface AddToLibraryRequest {
  courseId: number
}

// RESPONSE

export interface CreatePaymentIntentResponse {
  clientSecret: string
  status: PaymentIntent.Status
}