import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/format"
import type { PriceDiscountCurrency } from "@/types/common/price"
import { cn } from "@/lib/utils"
import { discountedPrice } from "@/lib/discountedPrice"

export interface CoursePriceBadgeProps extends PriceDiscountCurrency {
  className?: string
}

export const CoursePriceBadge = ({ price, discountPercent, currency, isFree, className }: CoursePriceBadgeProps) => {
  return !isFree ? (
    <>
      {discountPercent > 0 ? (
        <>
          <Badge variant="outline" className={cn("font-semibold gap-1.5", className)}>
            <span className="line-through text-muted-foreground">{formatPrice(price, currency)}</span>
            <span>{formatPrice(discountedPrice(price, discountPercent), currency)}</span>
          </Badge>
          
          <Badge className={cn("text-xs font-semibold text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/30", className)}>
            -{discountPercent}%
          </Badge>
        </>
      ) : (
        <Badge className={cn("font-semibold text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/30", className)}>
          {formatPrice(price, currency)}
        </Badge>
      )}
    </>
  ) : (
    <Badge className={cn("text-xs font-semibold text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/30", className)}>Gratis</Badge>
  )
}