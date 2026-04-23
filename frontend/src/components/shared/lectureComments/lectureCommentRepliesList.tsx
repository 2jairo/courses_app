import { useGetLectureCommentsQuery } from "@/queries/client/lectureComments/useGetLectureCommentsQuery"
import { CornerDownRight, Loader2 } from "lucide-react"
import { LectureCommentCard } from "./lectureCommentCard"
import { Button } from "@/components/ui/button"

interface LectureCommentRepliesListProps {
  lectureSlug: string
  parentCommentId: number
}

export function LectureCommentRepliesList({ lectureSlug, parentCommentId }: LectureCommentRepliesListProps) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useGetLectureCommentsQuery({
    lectureSlug,
    parentCommentId,
  })

  const replies = data?.pages.flatMap(p => p) || []

  if (isLoading) {
    return (
      <div className="flex items-center py-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {replies.map(reply => (
        <LectureCommentCard 
          key={reply.id}
          comment={reply}
          lectureSlug={lectureSlug}
          isReply
        />
      ))}
      {hasNextPage && (
        <div className="pt-2 flex">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:bg-muted h-8 px-2 flex items-center gap-2 rounded-full text-xs font-normal"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CornerDownRight className="h-3 w-3" />
            )}
            <span>
              {isFetchingNextPage ? "Cargando..." : "Cargar más respuestas"}
            </span>
          </Button>
        </div>
      )}
    </div>
  )
}