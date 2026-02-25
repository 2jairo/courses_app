import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { ClientQuizzesService } from "@/services/client/clientQuizzes.service"
import type { FinishQuizAttemptRequest } from "@/types/client/quizzes"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { getPlayLectureQueryKey } from "@/queries/client/lectures/usePlayLectureQuery"

export const useFinishQuizAttemptMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, FinishQuizAttemptRequest>({
    mutationFn: (data) => ClientQuizzesService.finishQuizAttempt(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries(getPlayLectureQueryKey({ lectureSlug: data.lectureSlug }))
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
