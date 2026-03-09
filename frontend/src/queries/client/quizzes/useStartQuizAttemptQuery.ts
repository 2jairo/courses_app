import { useQuery, useQueryClient } from "react-query"
import type { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"

import { ClientQuizzesService } from "@/services/client/clientQuizzes.service"
import type { StartQuizAttemptRequest, StartQuizAttemptResponse } from "@/types/client/quizzes"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { getPlayLectureQueryKey } from "../lectures/usePlayLectureQuery"
import type { PlayLectureResponse } from "@/types/client/lectures"

export const START_QUIZ_ATTEMPT_QUERY_KEY = "start_quiz_attempt"

export const getStartQuizAttemptQueryKey = (data: StartQuizAttemptRequest) => {
  return [START_QUIZ_ATTEMPT_QUERY_KEY, data] as const
}

export const useStartQuizAttemptQuery = (data: StartQuizAttemptRequest, enabled = true) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useQuery<StartQuizAttemptResponse, AxiosError<LocalErrorResponse>>({
    queryKey: getStartQuizAttemptQueryKey(data),
    queryFn: ({ signal }) => ClientQuizzesService.startQuizAttempt(data, { signal }),
    onSuccess: (resp) => {
      queryClient.setQueryData<PlayLectureResponse>(
        getPlayLectureQueryKey({ lectureSlug: data.lectureSlug }),
        (old) => {
          if(!old || old.kind !== 'Quiz') {
            return old!
          }

          return {
            ...old,
            data: {
              ...old.data,
              activeAttempt: true,
              activeAttemptExpiresAt: resp.expiresAt || undefined
            }
          }
        }
      )
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
    enabled: !!data.lectureSlug && enabled,
    staleTime: 0
  })
}
