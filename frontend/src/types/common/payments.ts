export const PAYMENT_STATUS = ['Pending', 'Succeeded', 'Failed', 'Refunded', 'PartiallyRefunded'] as const
export type PaymentStatus = typeof PAYMENT_STATUS[number];