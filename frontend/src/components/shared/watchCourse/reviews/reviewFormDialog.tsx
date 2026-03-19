import { useEffect } from "react"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { useCreateReviewMutation } from "@/mutations/client/courseReviews/useCreateReviewMutation"
import { useUpdateReviewMutation } from "@/mutations/client/courseReviews/useUpdateReviewMutation"
import type { ReviewResponse } from "@/types/client/courseReviews"
import { StarRating } from "../../../ui/star-rating"

const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, "Selecciona una calificación")
    .max(5),

  comment: z
    .string()
    .min(1, "Escribe un comentario")
    .max(1000, "El comentario no puede superar los 1000 caracteres")
    .trim(),
})

type ReviewFormValues = z.infer<typeof reviewSchema>

interface ReviewFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseSlug: string
  /** Pass an existing review to switch to edit mode */
  review?: ReviewResponse
}

export const ReviewFormDialog = ({
  open,
  onOpenChange,
  courseSlug,
  review,
}: ReviewFormDialogProps) => {
  const isEditing = Boolean(review)

  const createMutation = useCreateReviewMutation()
  const updateMutation = useUpdateReviewMutation()
  const isPending = createMutation.isLoading || updateMutation.isLoading

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: review?.rating ?? 0, comment: review?.comment ?? "" },
  })

  // Sync form when dialog opens or switches between create/edit
  useEffect(() => {
    reset({ rating: review?.rating ?? 0, comment: review?.comment ?? "" })
  }, [review, open, reset])

  const comment = useWatch({ control, name: "comment" })

  const onSubmit = (values: ReviewFormValues) => {
    if (isEditing && review) {
      updateMutation.mutate(
        { payload: { reviewId: review.id, ...values }, courseSlug },
        {
          onSuccess: () => {
            toast.success("Reseña actualizada")
            onOpenChange(false)
          },
        },
      )
    } else {
      createMutation.mutate(
        { courseSlug, ...values },
        {
          onSuccess: () => {
            toast.success("Reseña publicada")
            onOpenChange(false)
          },
        },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar reseña" : "Escribir reseña"}</DialogTitle>
        </DialogHeader>

        <form
          id="review-form"
          className="flex flex-col gap-4 py-2"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Field>
            <FieldLabel>Calificación</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="rating"
                render={({ field }) => (
                  <StarRating value={field.value} onChange={field.onChange} size="lg" />
                )}
              />
              <FieldError errors={[errors.rating]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="review-comment">Comentario</FieldLabel>
            <FieldContent>
              <Textarea
                id="review-comment"
                placeholder="Comparte tu experiencia con este curso..."
                rows={4}
                maxLength={1000}
                className="resize-none"
                aria-invalid={!!errors.comment}
                {...register("comment")}
              />
              <div className="flex items-start justify-between gap-2">
                <FieldError errors={[errors.comment]} />
                <p className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {(comment ?? "").length}/1000
                </p>
              </div>
            </FieldContent>
          </Field>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="review-form" disabled={isPending}>
            {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Publicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
