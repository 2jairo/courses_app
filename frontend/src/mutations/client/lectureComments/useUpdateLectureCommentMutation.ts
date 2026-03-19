import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { ClientLectureCommentsService } from "@/services/client/clientLectureComments.service"
import type { UpdateLectureCommentRequest, LectureCommentResponse } from "@/types/client/lectureComments"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { getLectureCommentsQueryKey } from "@/queries/client/lectureComments/useGetLectureCommentsQuery"

interface UpdateLectureCommentRequestWrapper {
  payload: UpdateLectureCommentRequest
  lectureSlug: string
  parentCommentId?: number
}

export const useUpdateLectureCommentMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<LectureCommentResponse, AxiosError<LocalErrorResponse>, UpdateLectureCommentRequestWrapper>({
    mutationFn: ({ payload }) => ClientLectureCommentsService.updateComment(payload),
    onSuccess: (_, { lectureSlug, parentCommentId }) => {
      queryClient.invalidateQueries(getLectureCommentsQueryKey({ lectureSlug, parentCommentId }))
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
