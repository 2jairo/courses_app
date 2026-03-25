export const PAYMENT_METHODS_PROVIDERS = ["Stripe"] as const
export type PaymentMethodProviders = typeof PAYMENT_METHODS_PROVIDERS[number];

export const CARD_FUNDING = ["credit", "debit", "prepaid", "unknown"] as const;
export type CardFunding = typeof CARD_FUNDING[number];

export const CARD_BRANDS = ["amex", "diners", "discover", "jcb", "mastercard", "unionpay", "unknown", "visa"] as const;
export type CardBrand = typeof CARD_BRANDS[number];


// Only the methods Card,Paypal,SEPADebit,BACSDebit,USBankAccount,AUBECSDebit,Link,Klarna,IDEAL,EPS,FPX,Grabpay add additional props
export const PAYMENT_METHOD_TYPES = [
  "acss_debit",
  "affirm",
  "afterpay_clearpay",
  "alipay",
  "alma",
  "amazon_pay",
  "au_becs_debit",
  "bacs_debit",
  "bancontact",
  "billie",
  "blik",
  "boleto",
  "card",
  "card_present",
  "cashapp",
  "crypto",
  "custom",
  "customer_balance",
  "eps",
  "fpx",
  "giropay",
  "grabpay",
  "ideal",
  "interac_present",
  "kakao_pay",
  "klarna",
  "konbini",
  "kr_card",
  "link",
  "mb_way",
  "mobilepay",
  "multibanco",
  "naver_pay",
  "nz_bank_account",
  "oxxo",
  "p24",
  "pay_by_bank",
  "payco",
  "paynow",
  "paypal",
  "payto",
  "pix",
  "promptpay",
  "revolut_pay",
  "samsung_pay",
  "satispay",
  "sepa_debit",
  "sofort",
  "swish",
  "twint",
  "us_bank_account",
  "wechat_pay",
  "zip",
] as const;

export type PaymentMethodType = typeof PAYMENT_METHOD_TYPES[number];