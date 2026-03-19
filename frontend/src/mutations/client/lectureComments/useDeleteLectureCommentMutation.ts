import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { ClientLectureCommentsService } from "@/services/client/clientLectureComments.service"
import type { DeleteLectureCommentRequest } from "@/types/client/lectureComments"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { getLectureCommentsQueryKey } from "@/queries/client/lectureComments/useGetLectureCommentsQuery"

interface DeleteLectureCommentRequestWrapper {
  payload: DeleteLectureCommentRequest
  lectureSlug: string
  parentCommentId?: number
}

export const useDeleteLectureCommentMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, DeleteLectureCommentRequestWrapper>({
    mutationFn: ({ payload }) => ClientLectureCommentsService.deleteComment(payload),
    onSuccess: (_, { lectureSlug, parentCommentId }) => {
      queryClient.invalidateQueries(getLectureCommentsQueryKey({ lectureSlug, parentCommentId }))
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
