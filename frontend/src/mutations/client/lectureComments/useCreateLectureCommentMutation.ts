import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { ClientLectureCommentsService } from "@/services/client/clientLectureComments.service"
import type { CreateLectureCommentRequest, LectureCommentResponse } from "@/types/client/lectureComments"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { getLectureCommentsQueryKey } from "@/queries/client/lectureComments/useGetLectureCommentsQuery"

export const useCreateLectureCommentMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<LectureCommentResponse, AxiosError<LocalErrorResponse>, CreateLectureCommentRequest>({
    mutationFn: (data) => ClientLectureCommentsService.createComment(data),
    onSuccess: (_, data) => {
      // Invalidate the specific lecture's comments.
      queryClient.invalidateQueries(getLectureCommentsQueryKey({ lectureSlug: data.lectureSlug, parentCommentId: data.parentCommentId }))
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
