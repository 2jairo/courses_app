import { useQuery } from "react-query"
import type { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"

import { ClientQuizzesService } from "@/services/client/clientQuizzes.service"
import type { GetLastQuizAttemptResultRequest, GetQuizAttemptDetailsResponse } from "@/types/client/quizzes"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const GET_QUIZ_ATTEMPT_DETAILS_QUERY_KEY = "get_quiz_attempt_details"

export const getGetQuizAttemptDetailsQueryKey = (data: GetLastQuizAttemptResultRequest) => {
  return [GET_QUIZ_ATTEMPT_DETAILS_QUERY_KEY, data] as const
}

export const useGetQuizAttemptDetailsQuery = (data: GetLastQuizAttemptResultRequest, enabled = true) => {
  const navigate = useNavigate()

  return useQuery<GetQuizAttemptDetailsResponse, AxiosError<LocalErrorResponse>>({
    queryKey: getGetQuizAttemptDetailsQueryKey(data),
    queryFn: ({ signal }) => ClientQuizzesService.getQuizAttemptDetails(data, { signal }),
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
    enabled: !!data.attemptId && enabled,
  })
}
