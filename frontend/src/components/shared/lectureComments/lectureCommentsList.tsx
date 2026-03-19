import { useEffect, useRef } from "react"
import { Loader2, MessageSquare } from "lucide-react"

import { useGetLectureCommentsQuery } from "@/queries/client/lectureComments/useGetLectureCommentsQuery"
import { useCreateLectureCommentMutation } from "@/mutations/client/lectureComments/useCreateLectureCommentMutation"

import { LectureCommentCard } from "./lectureCommentCard"
import { LectureCommentForm } from "./lectureCommentForm"
import type { LectureCommentFormSchema } from "./lectureCommentFormSchema"

interface LectureCommentsListProps {
  lectureSlug: string
}

export function LectureCommentsList({ lectureSlug }: LectureCommentsListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useGetLectureCommentsQuery({ lectureSlug })

  const createLectureCommentMutation = useCreateLectureCommentMutation()

  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const handleCreate = (values: LectureCommentFormSchema) => {
    createLectureCommentMutation.mutate({
      body: values.body,
      lectureSlug: lectureSlug
    })
  }

  const comments = data?.pages.flatMap((page) => page) || []

  return (
    <div className="flex flex-col space-y-6 w-full max-w-2xl mx-auto">
      <LectureCommentForm 
        submitLabel="Comentar"
        onSubmit={handleCreate}
        isSubmitting={createLectureCommentMutation.isLoading}
      />

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border rounded-lg border-dashed">
            <MessageSquare className="h-10 w-10 mb-3 opacity-20" />
            <p>No hay comentarios todavía.</p>
          </div>
        ) : (
          <div className="border rounded-lg bg-card">
            {comments.map((comment) => (
              <LectureCommentCard
                key={comment.id}
                comment={comment}
                lectureSlug={lectureSlug}
              />
            ))}
          </div>
        )}

        {/* Intersection observer target for infinite scroll */}
        <div ref={observerTarget} className="h-2" />

        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  )
}
