
// REQUEST

import type { CardBrand, CardFunding, PaymentMethodProviders, PaymentMethodType } from "../common/paymentMethods"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CreateSetupIntentRequest {
}


export interface FinishSetupIntentRequest {
  setupIntentId: string  
  isDefault: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetPaymentMethodsRequest {}

export interface RemovePaymentMethodRequest {
  paymentMethodId: number
}

export interface UpdatePaymentMethodRequestBodyAddress {
  city?: string
  country?: string
  line1?: string
  line2?: string
  postalCode?: string
  state?: string
}

export interface UpdatePaymentMethodRequestBodyBillingDetails {
  address?: UpdatePaymentMethodRequestBodyAddress
  email?: string
  name?: string
  phone?: string
}

export interface UpdatePaymentMethodRequest {
  paymentMethodId: number
  isDefault?: boolean
  expiryMonth?: number
  expiryYear?: number
  billingDetails?: UpdatePaymentMethodRequestBodyBillingDetails
}


// RESPONSE
export interface CreateSetupIntentResponse {
  clientSecret: string
}

export interface PaymentMethodResponse {
  id: number
  createdAt: string
  updatedAt: string
  provider: PaymentMethodProviders
  methodType: PaymentMethodType // Stripe payment method type, such as card, paypal, or sepa_debit.
  lastFour?: string
  expiryMonth?: number
  expiryYear?: number
  cardholderName?: string
  cardBrand?: CardBrand
  cardFunding?: CardFunding
  email?: string
  bankName?: string // For bank-based methods (SEPA, BACS, US Bank Account, AU BECS)
  bankCode?: string // BSB, sort code, bank code
  accountType?: string // "checking", "savings" for US bank accounts
  country?: string // ISO country code (For methods that have a country (PayPal, SEPA, iDEAL, etc.))
  isDefault: boolean
}
