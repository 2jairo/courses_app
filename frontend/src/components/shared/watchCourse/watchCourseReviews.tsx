import { useState } from "react"
import { PenLine } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { UserAuthServiceUserProfileResponse } from "@/types/client/auth"
import type { WatchCourseResponse } from "@/types/client/courses"
import type { ReviewResponse } from "@/types/client/courseReviews"
import { CCP } from "@/lib/clientCoursePermissions"
import { ReviewsList } from "./reviews/reviewsList"
import { ReviewFormDialog } from "./reviews/reviewFormDialog"
import { formatViews } from "@/lib/format"

interface WatchCourseReviewsProps {
  course: WatchCourseResponse
  currentUser: UserAuthServiceUserProfileResponse | null
  id: string
}

export const WatchCourseReviews = ({ id, course, currentUser }: WatchCourseReviewsProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<ReviewResponse | undefined>(undefined)

  const canCreate = CCP.canCreateReview(currentUser)

  const handleOpenCreate = () => {
    setEditingReview(undefined)
    setDialogOpen(true)
  }

  const handleOpenEdit = (review: ReviewResponse) => {
    setEditingReview(review)
    setDialogOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) setEditingReview(undefined)
  }

  return (
    <section
      className="scroll-mt-20 flex-1 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
      id={id}
    >
      <Card className="border-0 shadow-none gap-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">Reseñas ({formatViews(course.stats.totalReviews)})</CardTitle>

          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenCreate}
            disabled={!canCreate}
          >
            <PenLine className="size-4 mr-1.5" />
            Escribir reseña
          </Button>
        </CardHeader>

        <CardContent className="pt-0">
          <ReviewsList
            courseSlug={course.slug}
            currentUser={currentUser}
            onEditReview={handleOpenEdit}
          />
        </CardContent>
      </Card>

      <ReviewFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        courseSlug={course.slug}
        review={editingReview}
      />
    </section>
  )
}