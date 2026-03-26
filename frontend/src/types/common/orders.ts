
export const ORDER_STATUS = ["Pending", "Paid", "Cancelled", "Refunded", "PartiallyRefunded"] as const
export type OrderStatus = typeof ORDER_STATUS[number];

