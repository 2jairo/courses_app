import { useState } from "react"
import { MoreVertical, Edit2, Trash2, CornerDownRight, ChevronDown, ChevronUp, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { LectureCommentResponse } from "@/types/client/lectureComments"
import { LectureCommentForm } from "./lectureCommentForm"
import type { LectureCommentFormSchema } from "./lectureCommentFormSchema"
import { UserAvatar } from "../userAvatar/userAvatar"
import { useGetLectureCommentsQuery } from "@/queries/client/lectureComments/useGetLectureCommentsQuery"
import { useCreateLectureCommentMutation } from "@/mutations/client/lectureComments/useCreateLectureCommentMutation"
import { useUpdateLectureCommentMutation } from "@/mutations/client/lectureComments/useUpdateLectureCommentMutation"
import { useDeleteLectureCommentMutation } from "@/mutations/client/lectureComments/useDeleteLectureCommentMutation"

interface LectureCommentCardProps {
  comment: LectureCommentResponse
  lectureSlug: string
  isReply?: boolean
}

export function LectureCommentCard({ comment, lectureSlug, isReply = false }: LectureCommentCardProps) {
  const createMutation = useCreateLectureCommentMutation()
  const updateMutation = useUpdateLectureCommentMutation()
  const deleteMutation = useDeleteLectureCommentMutation()

  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [showReplies, setShowReplies] = useState(false)

  const handleUpdate = (values: LectureCommentFormSchema) => {
    updateMutation.mutate({
      lectureSlug: lectureSlug,
      payload: {
        body: values.body,
        commentId: comment.id
      }
    }, {
      onSuccess: () => {
        setIsEditing(false)
      }
    })
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    deleteMutation.mutate({
      lectureSlug: lectureSlug,
      payload: {
        commentId: comment.id,
      }
    }, {
      onSuccess: () => {
        setIsDeleting(false)
      }
    })
  }

  const handleReplySubmit = (values: LectureCommentFormSchema) => {
    createMutation.mutate({
      lectureSlug,
      parentCommentId: comment.id,
      body: values.body,
    }, {
      onSuccess: () => {
        setIsReplying(false)
        setShowReplies(true)
      }
    })
  }

  const dateFormatted = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(comment.createdAt))

  const showMenu = comment.author.isSelf || !isReply

  if (isEditing) {
    return (
      <div className={`flex gap-4 p-4 ${isReply ? "" : "border-b last:border-0 hover:bg-muted/30 transition-colors"} bg-background`}>
        <UserAvatar avatar={comment.author.avatar} username={comment.author.username} />

        <div className="flex-1">
          <LectureCommentForm 
            initialValues={{ body: comment.body }}
            onSubmit={handleUpdate}
            isSubmitting={updateMutation.isLoading}
            onCancel={() => setIsEditing(false)}
            submitLabel="Guardar"
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex gap-4 p-4 ${isReply ? "py-2 px-0" : "border-b last:border-0 hover:bg-muted/30"} transition-colors ${isDeleting ? "opacity-50" : ""}`}>
      <div className="shrink-0">
        <UserAvatar avatar={comment.author.avatar} username={comment.author.username} />
      </div>
      
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{comment.author.username}</span>
            {comment.author.isStaff && (
              <span className="bg-primary/10 text-primary px-1.5 rounded text-[10px] font-bold uppercase tracking-wider">
                Staff
              </span>
            )}
            <span className="text-xs text-muted-foreground">{dateFormatted}</span>
            {comment.createdAt !== comment.updatedAt && (
              <span className="text-xs text-muted-foreground">(editado)</span>
            )}
          </div>
          
          {showMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0" disabled={isDeleting}>
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isReply && (
                  <DropdownMenuItem onClick={() => setIsReplying(true)}>
                    <CornerDownRight className="mr-2 h-4 w-4" />
                    Responder
                  </DropdownMenuItem>
                )}
                {comment.author.isSelf && (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="text-sm text-foreground whitespace-pre-wrap break-all">
          {comment.body}
        </div>
        
        {!isReply && comment.replyCount > 0 && !showReplies && (
          <div className="pt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:bg-primary/10 hover:text-primary h-8 px-2 flex items-center gap-2 rounded-full"
              onClick={() => setShowReplies(true)}
            >
              <ChevronDown className="h-4 w-4 text-primary" />
              <span>
                {comment.replyCount} {comment.replyCount === 1 ? 'respuesta' : 'respuestas'}
              </span>
              {comment.replyFromStaff && (
                <span className="bg-primary/10 text-primary px-1.5 rounded text-[10px] font-bold uppercase tracking-wider ml-1">
                  Respuesta del Staff
                </span>
              )}
            </Button>
          </div>
        )}

        {showReplies && (
          <div className="pt-2">
            <div className="border-l-2 pl-4 border-muted space-y-4">
              <LectureCommentRepliesList 
                lectureSlug={lectureSlug}
                parentCommentId={comment.id}
              />
            </div>
            <div className="mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:bg-muted h-8 px-2 flex items-center gap-2 rounded-full"
                onClick={() => setShowReplies(false)}
              >
                <ChevronUp className="h-4 w-4" />
                <span>Ocultar respuestas</span>
              </Button>
            </div>
          </div>
        )}

        {isReplying && (
          <div className="mt-4 pt-2">
            <LectureCommentForm
              onSubmit={handleReplySubmit}
              onCancel={() => setIsReplying(false)}
              isSubmitting={createMutation.isLoading}
              submitLabel="Responder"
            />
          </div>
        )}
      </div>
    </div>
  )
}

interface LectureCommentRepliesListProps {
  lectureSlug: string
  parentCommentId: number
}

function LectureCommentRepliesList({ lectureSlug, parentCommentId }: LectureCommentRepliesListProps) {
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
