import type { ShoppingCartItemDestination } from "@/types/common/shoppingCart"
import type { CoursePermissionsRole } from "@/types/common/coursePermissions"
import type { CourseLecturesAccesibility, CourseVisibility } from "@/types/common/courses"
import type { FileKind, FileStatus } from "@/types/common/files"
import type { LectureKind, LectureVisibility } from "@/types/common/lectures"
import type { QuizQuestionKind, QuizQuestionStatus } from "@/types/common/quizzesQuestions"
import type { BrowserType, DeviceType, OperatingSystem } from "@/types/client/auth"
import type { Currency } from "@/types/common/price"
import type { OrderStatus } from "@/types/common/orders"
import type { PaymentStatus } from "@/types/common/payments"
import type { CardBrand, CardFunding, PaymentMethodProviders, PaymentMethodType } from "@/types/common/paymentMethods"

export const formatShoppingCartItemDestination = (v: ShoppingCartItemDestination) => {
  switch (v) {
    case "CurrentUser": return "Para mí"
    case "Gift": return "Para regalar"
  }
}

// CourseVisibility
export const formatCourseVisibility = (v: CourseVisibility) => {
  switch (v) {
    case "Link": return "Por link"
    case "Private": return "Privado"
    case "Public": return "Público"
  }
}

export const formatOrderStatus = (status: OrderStatus) => {
  switch (status) {
    case "Pending": return "Pendiente"
    case "Paid": return "Pagado"
    case "Cancelled": return "Cancelado"
    case "Refunded": return "Reembolsado"
    case "PartiallyRefunded": return "Reembolso Parcial"
  }
}

export const formatPaymentStatus = (status: PaymentStatus) => {
  switch (status) {
    case "Pending": return "Pendiente"
    case "Succeeded": return "Éxito"
    case "Failed": return "Fallido"
    case "Refunded": return "Reembolsado"
    case "PartiallyRefunded": return "Reembolso Parcial"
  }
}

export const formatCourseLectureAccesibility = (v: CourseLecturesAccesibility) => {
  switch (v) {
    case "Open": return "Abierta"
    case "Section": return "Por sección"
    case "QuizOrLab": return "Por cuestionario o laboratorio"
    case "Closed": return "Cerrada"
  }
}

// CoursePermissionsRole
export const formatCoursePermissionsRole = (role: CoursePermissionsRole) => {
  switch (role) {
    case "Owner": return "Propietario"
    case "Admin": return "Administrador"
    case "Write": return "Escritura"
    case "Read": return "Lectura"
  }
}

// LectureVisibility
export const formatLectureVisibility = (v: LectureVisibility) => {
  switch (v) {
    case "Link": return "Por link"
    case "Private": return "Privado"
    case "Public": return "Público"
  }
}

// LectureKind
export const formatLectureKind = (kind: LectureKind) => {
  switch (kind) {
    case "Video": return "Vídeo"
    case "Document": return "Documento"
    case "Quiz": return "Cuestionario"
    case "Lab": return "Laboratorio"
  }
}

// QuizQuestionKind
export const formatQuizQuestionKind = (kind: QuizQuestionKind) => {
  switch (kind) {
    case "BoolMultiple": return "Verdadero/Falso (Múltiple)"
    case "BoolSingle": return "Verdadero/Falso (Única)"
    case "TextMultiple": return "Respuesta (Múltiple)"
    case "TextSingle": return "Respuesta (Única)"
    case "Match": return "Emparejar"
    case "Ordering": return "Ordenar"
  }
}

// QuizQuestionStatus
export const formatQuizQuestionStatus = (status: QuizQuestionStatus) => {
  switch (status) {
    case "Public": return "Pública"
    case "Private": return "Privada"
  }
}


export const formatFileStatus = (kind: FileStatus) => {
  switch (kind) {
    case "Pending": return "Pendiente"
    case "Processing": return "Procesando"
    case "Ready": return "Listo"
    case "Failed": return "Fallido"
  }
}

export const formatFileKind = (kind: FileKind) => {
  switch (kind) {
    case "Image": return "Imagen"
    case "Video": return "Vídeo"
    case "Other": return "Otro"
  }
}

export const formatCardExpiry = (month?: number, year?: number) => {
  if (!month || !year) return ""
  return `${month.toString().padStart(2, "0")}/${year.toString().slice(-2)}`
}

export const formatPaymentProvider = (provider: PaymentMethodProviders) => {
  switch (provider) {
    // case "visa": return "Visa"
    // case "mastercard": return "Mastercard"
    // case "amex": return "American Express"
    // case "discover": return "Discover"
    // case "diners_club": return "Diners Club"
    // case "jcb": return "JCB"
    // case "unionpay": return "UnionPay"
    case 'Stripe': return 'Stripe'
    default: return provider
  }
}

export const formatCardBrand = (brand?: CardBrand) => {
  if (!brand) return "Tarjeta"
  switch (brand) {
    case "amex": return "American Express"
    case "diners": return "Diners Club"
    case "discover": return "Discover"
    case "jcb": return "JCB"
    case "mastercard": return "Mastercard"
    case "unionpay": return "UnionPay"
    case "visa": return "Visa"
    case "unknown": return "Tarjeta Desconocida"
    default: return brand
  }
}

export const formatCardFunding = (funding?: CardFunding) => {
  if (!funding) return ""
  switch (funding) {
    case "credit": return "Crédito"
    case "debit": return "Débito"
    case "prepaid": return "Prepago"
    case "unknown": return ""
    default: return funding
  }
}

export const formatPaymentMethodName = (methodType?: PaymentMethodType, cardBrand?: CardBrand, bankName?: string) => {
  if (!methodType) return "Método de pago"
  if (methodType === 'card') return formatCardBrand(cardBrand)
  if (methodType === 'paypal') return 'PayPal'
  if (bankName) return bankName

  switch (methodType) {
    case "acss_debit": return "Débito ACSS"
    case "affirm": return "Affirm"
    case "afterpay_clearpay": return "Afterpay / Clearpay"
    case "alipay": return "Alipay"
    case "alma": return "Alma"
    case "amazon_pay": return "Amazon Pay"
    case "au_becs_debit": return "Débito AU BECS"
    case "bacs_debit": return "Débito BACS"
    case "bancontact": return "Bancontact"
    case "billie": return "Billie"
    case "blik": return "BLIK"
    case "boleto": return "Boleto"
    case "card_present": return "Tarjeta (Presencial)"
    case "cashapp": return "Cash App Pay"
    case "crypto": return "Criptomonedas"
    case "custom": return "Personalizado"
    case "customer_balance": return "Saldo de Cliente"
    case "eps": return "EPS"
    case "fpx": return "FPX"
    case "giropay": return "Giropay"
    case "grabpay": return "GrabPay"
    case "ideal": return "iDEAL"
    case "interac_present": return "Interac"
    case "kakao_pay": return "Kakao Pay"
    case "klarna": return "Klarna"
    case "konbini": return "Konbini"
    case "kr_card": return "Tarjeta de Corea"
    case "link": return "Link"
    case "mb_way": return "MB WAY"
    case "mobilepay": return "MobilePay"
    case "multibanco": return "Multibanco"
    case "naver_pay": return "Naver Pay"
    case "nz_bank_account": return "Cuenta Bancaria NZ"
    case "oxxo": return "OXXO"
    case "p24": return "Przelewy24"
    case "pay_by_bank": return "Pago por Banco"
    case "payco": return "Payco"
    case "paynow": return "PayNow"
    case "payto": return "PayTo"
    case "pix": return "Pix"
    case "promptpay": return "PromptPay"
    case "revolut_pay": return "Revolut Pay"
    case "samsung_pay": return "Samsung Pay"
    case "satispay": return "Satispay"
    case "sepa_debit": return "Débito SEPA"
    case "sofort": return "Sofort"
    case "swish": return "Swish"
    case "twint": return "TWINT"
    case "us_bank_account": return "Cuenta Bancaria US"
    case "wechat_pay": return "WeChat Pay"
    case "zip": return "Zip"
  }
  
  return (methodType as string).replace('_', ' ')
}

export const getFileStatusVariant = (status: FileStatus) => {
  switch (status) {
    case "Pending":
      return "secondary"
    case "Processing":
      return "outline"
    case "Ready":
      return "default"
    case "Failed":
      return "destructive"
  }
}




export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatPrice = (price: number, currency?: Currency) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency ? currency.toUpperCase() : "EUR",
  }).format(price / 100)
}

export const formatFileSize = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 B"
  
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * Math.pow(10, decimals)) / Math.pow(10, decimals) + " " + sizes[i]
}

export const formatDurationDateString = (dateString: string, withSuffix = false) => {
  const diffMs = Date.now() - new Date(dateString).getTime()
  const duration = formatDuration(Math.abs(diffMs) / 1000, withSuffix)

  if (!withSuffix) return duration
  return diffMs >= 0 ? `hace ${duration}` : `en ${duration}`
}

export const formatDuration = (seconds: number, withSuffix = false) => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  if (hrs > 0) {
    const time = `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    return withSuffix ? `${time}h` : time
  }
  
  const time = `${mins}:${secs.toString().padStart(2, "0")}`
  return withSuffix ? `${mins}m ${secs}s` : time
}

export const timeSince = (dateString: string) => {
  const ms = Date.now() - new Date(dateString).getTime()
  const isPast = ms >= 0
  const seconds = Math.floor(Math.abs(ms) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  const when = (value: number, unit: string) => {
    const plural = value > 1 ? "s" : ""
    return isPast ? `hace ${value} ${unit}${plural}` : `en ${value} ${unit}${plural}`
  }

  if (years > 0) return when(years, "año")
  if (months > 0) return isPast ? `hace ${months} mes${months > 1 ? 'es' : ''}` : `en ${months} mes${months > 1 ? 'es' : ''}`
  if (weeks > 0) return when(weeks, "semana")
  if (days > 0) return when(days, "día")
  if (hours > 0) return when(hours, "hora")
  if (minutes > 0) return when(minutes, "minuto")
  return when(seconds, "segundo")
}

export const videoResolutionPretty = (height: number): string => {
  if (height >= 2160) return "4K"
  if (height >= 1440) return "2K"
  if (height >= 1080) return "FHD"
  if (height >= 720) return "HD"
  if (height >= 480) return "SD"
  return ""
}

export const formatLanguage = (lang: string) => {
  switch (lang) {
    case "es": return "Español"
    case "en": return "Inglés"
    case "fr": return "Francés"  
    case "de": return "Alemán"
    case "it": return "Italiano"
    case "pt": return "Portugués"
    case "ru": return "Ruso"
    case "zh": return "Chino"
    case "ja": return "Japonés"
    case "ko": return "Coreano"
    case "ar": return "Árabe"
    case "hi": return "Hindi"
    case "nl": return "Holandés"
    default: return lang
  }
}

export const formatViews = (views: number) => {
  if (views < 1000) return `${views}`
  if (views < 1_000_000) return `${(views / 1000).toFixed(1).replace(/\.0$/, "")} mil`
  if (views < 1_000_000_000) return `${(views / 1_000_000).toFixed(1).replace(/\.0$/, "")} M`
  return `${(views / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} B`
}

export function calculateProgress(completed: number, total: number) {
  return total > 0 ? Math.round((completed / total) * 100) : 0
}

// Session
export const formatBrowser = (browser: BrowserType) => {
  switch (browser) {
    case "Chrome": return "Chrome"
    case "Safari": return "Safari"
    case "Firefox": return "Firefox"
    case "Edge": return "Microsoft Edge"
    case "InternetExplorer": return "Internet Explorer"
    case "Opera": return "Opera"
    case "Brave": return "Brave"
    case "Other": return "Navegador desconocido"
  }
}

export const formatOs = (os: OperatingSystem) => {
  switch (os) {
    case "Windows": return "Windows"
    case "MacOS": return "macOS"
    case "IOS": return "iOS"
    case "Android": return "Android"
    case "Linux": return "Linux"
    case "ChromeOS": return "Chrome OS"
    case "Other": return "SO desconocido"
  }
}

export const formatDeviceType = (device: DeviceType) => {
  switch (device) {
    case "Desktop": return "Escritorio"
    case "Mobile": return "Móvil"
    case "Tablet": return "Tablet"
    case "SmartTv": return "Smart TV"
    case "Other": return "Dispositivo desconocido"
  }
}