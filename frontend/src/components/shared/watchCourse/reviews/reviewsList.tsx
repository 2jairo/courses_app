import { useEffect, useRef, useState } from "react"
import { MessageSquare, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { useGetReviewsQuery } from "@/queries/client/courseReviews/useGetReviewsQuery"
import type { ReviewResponse } from "@/types/client/courseReviews"
import type { UserAuthServiceUserProfileResponse } from "@/types/client/auth"
import { StarRating } from "@/components/ui/star-rating"
import { ReviewCard } from "./reviewCard"

interface ReviewsListProps {
  courseSlug: string
  currentUser: UserAuthServiceUserProfileResponse | null
  onEditReview: (review: ReviewResponse) => void
}

export const ReviewsList = ({ courseSlug, currentUser, onEditReview }: ReviewsListProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } = useGetReviewsQuery(
    { courseSlug, rating: selectedRating },
    { enabled: hasBeenVisible }
  )

  const reviews = data?.pages.flat() ?? []

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <p>Filtrar por:</p>

        <StarRating 
          value={selectedRating || 0} 
          size="sm" 
          onChange={(newRating) => setSelectedRating(newRating)}
        />
        <button 
          className="p-1 hover:bg-accent rounded transition-colors"
          onClick={() => setSelectedRating(undefined)}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {reviews.length === 0 && (
        <Empty className="border py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquare />
            </EmptyMedia>
            <EmptyTitle>Sin reseñas</EmptyTitle>
            <EmptyDescription>Sé el primero en dejar una reseña sobre este curso.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {reviews.length > 0 && (
        <>
          {reviews.map((review, i) => (
            <div key={review.id}>
              <ReviewCard review={review} currentUser={currentUser} onEdit={onEditReview} />
              {i < reviews.length - 1 && <Separator />}
            </div>
          ))}
          {hasNextPage && (
            <div className="pt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Cargando..." : "Cargar más reseñas"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}