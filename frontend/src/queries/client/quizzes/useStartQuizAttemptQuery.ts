import { useQuery } from "react-query"
import type { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"

import { ClientQuizzesService } from "@/services/client/clientQuizzes.service"
import type { StartQuizAttemptRequest, StartQuizAttemptResponse } from "@/types/client/quizzes"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const START_QUIZ_ATTEMPT_QUERY_KEY = "start_quiz_attempt"

export const getStartQuizAttemptQueryKey = (data: StartQuizAttemptRequest) => {
  return [START_QUIZ_ATTEMPT_QUERY_KEY, data] as const
}

export const useStartQuizAttemptQuery = (data: StartQuizAttemptRequest, enabled = true) => {
  const navigate = useNavigate()

  return useQuery<StartQuizAttemptResponse, AxiosError<LocalErrorResponse>>({
    queryKey: getStartQuizAttemptQueryKey(data),
    queryFn: ({ signal }) => ClientQuizzesService.startQuizAttempt(data, { signal }),
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
    enabled: !!data.lectureSlug && enabled,
  })
}
