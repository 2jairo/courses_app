import { Link } from "react-router-dom"
import { BookOpen, Heart, Image as ImageIcon, Loader2, Star, Users } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice, formatViews } from "@/lib/format"
import { discountedPrice } from "@/lib/discountedPrice"
import { cn } from "@/lib/utils"
import type { SearchCoursesCourseResponse } from "@/types/client/search"
import type { AnalyticsViewSource } from "@/types/common/analytics"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export interface CourseCardProps {
  course: SearchCoursesCourseResponse
  viewSource?: AnalyticsViewSource
  scrollToTop?: boolean
  isFavorite?: boolean
  isFavoriteLoading?: boolean
  onToggleFavorite?: () => void
}

export const CourseCard = ({
  course,
  viewSource = 'Direct',
  scrollToTop,
  isFavorite,
  isFavoriteLoading,
  onToggleFavorite,
}: CourseCardProps) => {
  const currentPrice = course.discountPercent > 0 
    ? discountedPrice(course.price, course.discountPercent)
    : course.price

  const canToggleFavorite = typeof isFavorite === "boolean" && !!onToggleFavorite

  const handleClick = () => {
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleToggleFavorite = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (!onToggleFavorite) {
      return
    }

    onToggleFavorite()
  }

  return (
    <Link to={ `/watch/${course.slug}?viewSource=${viewSource}`} className="cursor-default" onClick={handleClick}>
      <Card className="p-0 h-full flex flex-col hover:shadow-lg transition-shadow overflow-hidden group">
        <CardHeader className="p-0 relative aspect-video overflow-hidden bg-muted flex items-center justify-center">
          {course.poster ? (
            <img
              src={course.poster}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
          )}
          {course.discountPercent > 0 && (
            <Badge className="absolute top-2 right-2">
              -{course.discountPercent}%
            </Badge>
          )}
        </CardHeader>
        
        <CardContent className="flex-1">
          <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {course.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {course.avgRating.toFixed(1)} ({formatViews(course.totalReviews)})
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {formatViews(course.totalPurchases)}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {course.lecturesAmmount}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-3">
            {course.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] font-normal">
                {tag}
              </Badge>
            ))}
            {course.tags.length > 3 && (
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                  <p>&nbsp; ...</p>
                </TooltipTrigger>
                <TooltipContent>
                  {course.tags.slice(3).map((tag) => (
                    <Badge key={tag} variant="ghost" className="text-[10px] font-normal">
                      {tag}
                    </Badge>
                  ))}
                </TooltipContent>
              </Tooltip>
            )}

          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{course.author}</span>

            {canToggleFavorite && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className={cn(
                  "h-7 w-7 rounded-full",
                  isFavorite ? "text-destructive hover:text-destructive" : ""
                )}
                onClick={handleToggleFavorite}
                disabled={isFavoriteLoading}
                aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              >
                {isFavoriteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={cn("h-4 w-4", isFavorite ? "fill-current" : "")} />
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {course.discountPercent > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(course.price)}
              </span>
            )}
            <span className="font-bold text-lg">
              {currentPrice <= 0 ? "Gratis" : formatPrice(currentPrice)}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
