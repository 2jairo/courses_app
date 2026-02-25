import { useNavigate } from "react-router-dom"
import { useQuery } from "react-query"
import type { AxiosError } from "axios"

import { QuizzesService } from "@/services/quizzes.service"
import type { QuizResponseExtended, GetQuizDetailsRequest } from "@/types/dashboard/quizzes"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const QUIZ_DETAILS_QUERY_KEY = "quizDetails"

export const getQuizDetailsQueryKey = (data: GetQuizDetailsRequest) => {
  return [QUIZ_DETAILS_QUERY_KEY, data] as const
}

export const useQuizDetailsQuery = (data: GetQuizDetailsRequest) => {
  const navigate = useNavigate()
  
  return useQuery<QuizResponseExtended, AxiosError<LocalErrorResponse>>({
    queryKey: getQuizDetailsQueryKey(data),
    queryFn: ({ signal }) => QuizzesService.getQuizDetails(data, { signal }),
    onError: (e) => queryOrMutationDefaultOnError(e, navigate, `/dashboard/courses/${data.courseId}`),
    enabled: data.quizId !== null && data.quizId > 0 && data.courseId !== null && data.courseId > 0,
  })
}
