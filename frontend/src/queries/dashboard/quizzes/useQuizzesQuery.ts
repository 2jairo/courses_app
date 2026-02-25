import { useNavigate } from "react-router-dom"
import { useInfiniteQuery } from "react-query"
import type { AxiosError } from "axios"

import { QuizzesService } from "@/services/quizzes.service"
import type { GetQuizzesRequest, QuizResponse } from "@/types/dashboard/quizzes"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const QUIZZES_QUERY_KEY = "quizzes"
export const QUIZZES_PAGE_SIZE = 15

export const getQuizzesQueryKey = (data: GetQuizzesRequest) => {
  return [QUIZZES_QUERY_KEY, data] as const
}

export const useQuizzesQuery = (data: GetQuizzesRequest) => {
  const navigate = useNavigate()

  return useInfiniteQuery<QuizResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getQuizzesQueryKey(data),
    queryFn: ({ pageParam, signal }) => QuizzesService.getQuizzes({
      ...data,
      page: pageParam?.page || 1,
      size: pageParam?.size || QUIZZES_PAGE_SIZE,
    }, { signal }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < QUIZZES_PAGE_SIZE ? undefined : {
        page: allPages.length + 1,
        size: QUIZZES_PAGE_SIZE,
      }
    },
    enabled: data.courseId > 0,
    onError: (e) => queryOrMutationDefaultOnError(e, navigate, `/dashboard/courses/${data.courseId}`),
  })
}
