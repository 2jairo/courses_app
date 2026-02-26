import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import type { DeleteQuizRequest } from "@/types/dashboard/quizzes"
import { QuizzesService } from "@/services/dashboard/quizzes.service"
import { QUIZZES_QUERY_KEY } from "@/queries/dashboard/quizzes/useQuizzesQuery"

interface DeleteQuizRequestWrapper extends DeleteQuizRequest {
  courseId: number
}

export const useDeleteQuizMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, DeleteQuizRequestWrapper>({
    mutationFn: (payload) => QuizzesService.deleteQuiz(payload),
    onSuccess: () => {
      queryClient.invalidateQueries([QUIZZES_QUERY_KEY])
    },
    onError: (e, variables) => queryOrMutationDefaultOnError(e, navigate, `/dashboard/courses/${variables.courseId}`)
  })
}
