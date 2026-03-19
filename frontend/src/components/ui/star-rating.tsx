import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: "size-3.5",
  md: "size-5",
  lg: "size-6",
}

export const StarRating = ({
  value,
  onChange,
  readonly = false,
  size = "md",
  className,
}: StarRatingProps) => {
  const iconClass = sizeMap[size]
  const [hoveredStars, setHoveredStars] = useState(value)

  useEffect(() => {
    setHoveredStars(value)
  }, [value])

  return (
    <div className="flex">
      <div 
        className={cn("flex items-center gap-0.5", className)}
        onMouseLeave={() => setHoveredStars(value)}
      >
        {Array.from({ length: 5 }, (_, i) => {
          const starValue = i + 1
          const filled = starValue <= hoveredStars

          return (
            <button
              key={starValue}
              type="button"
              disabled={readonly}
              onClick={() => onChange?.(starValue)}
              className={cn(
                "transition-colors focus-visible:outline-none",
                !readonly && "cursor-pointer",
              )}
              aria-label={readonly ? undefined : `Calificar con ${starValue}`}
              onMouseEnter={() => setHoveredStars(starValue)}
            >
              <Star
                className={cn(
                  iconClass,
                  filled ? "fill-yellow-400 text-yellow-400" : "fill-none text-muted-foreground",
                  !readonly && !filled && "hover:fill-yellow-300 hover:text-yellow-300",
                )}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
