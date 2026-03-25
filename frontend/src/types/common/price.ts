export type Currency = 'EUR'
export interface PriceDiscountCurrency {
  price: number
  discountPercent: number
  currency: Currency
  isFree: boolean
}