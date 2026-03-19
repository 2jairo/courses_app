import { Pencil } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CCP } from "@/lib/clientCoursePermissions"
import type { ReviewResponse } from "@/types/client/courseReviews"
import type { UserAuthServiceUserProfileResponse } from "@/types/client/auth"
import { StarRating } from "../../../ui/star-rating"

interface ReviewCardProps {
  review: ReviewResponse
  currentUser: UserAuthServiceUserProfileResponse | null
  onEdit: (review: ReviewResponse) => void
}

export const ReviewCard = ({ review, currentUser, onEdit }: ReviewCardProps) => {
  const canEdit = CCP.canModifyReview(currentUser, review)
  const initials = review.author.username.slice(0, 2).toUpperCase()

  return (
    <div className="flex gap-3 py-4">
      <Avatar className="size-9 shrink-0">
        <AvatarImage src={review.author.avatar ?? undefined} alt={review.author.username} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium leading-none">{review.author.username}</span>
            <StarRating value={review.rating} readonly size="sm" />
          </div>

          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(review)}
              aria-label="Editar reseña"
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
        </div>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed wrap-break-word">
          {review.comment}
        </p>
      </div>
    </div>
  )
}
