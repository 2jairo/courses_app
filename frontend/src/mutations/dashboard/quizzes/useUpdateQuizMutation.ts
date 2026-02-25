import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { QuizzesService } from "@/services/quizzes.service"
import type { UpdateQuizRequest, QuizResponse } from "@/types/dashboard/quizzes"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { getQuizDetailsQueryKey } from "@/queries/dashboard/quizzes/useQuizDetailsQuery"

interface UpdateQuizRequestWrapper {
  payload: UpdateQuizRequest
  courseId: number
}

export const useUpdateQuizMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<QuizResponse, AxiosError<LocalErrorResponse>, UpdateQuizRequestWrapper>({
    mutationFn: ({ payload }) => QuizzesService.updateQuiz(payload),
    onSuccess: (_, variables) => {
      // Invalidate quiz details to refetch updated properties
      queryClient.invalidateQueries(getQuizDetailsQueryKey({ 
        courseId: variables.courseId, 
        quizId: variables.payload.quizId 
      }))
    },
    onError: (e, variables) => queryOrMutationDefaultOnError(e, navigate, `/dashboard/courses/${variables.courseId}`)
  })
}
