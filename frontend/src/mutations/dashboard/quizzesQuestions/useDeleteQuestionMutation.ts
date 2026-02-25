import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import type { DeleteQuestionRequest } from "@/types/dashboard/quizzesQuestions"
import { QuizzesQuestionsService } from "@/services/quizzesQuestions.service"
import { getQuizDetailsQueryKey } from "@/queries/dashboard/quizzes/useQuizDetailsQuery"

interface DeleteQuestionRequestWrapper extends DeleteQuestionRequest {
  courseId: number
  quizId: number
}

export const useDeleteQuestionMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, DeleteQuestionRequestWrapper>({
    mutationFn: (payload) => QuizzesQuestionsService.deleteQuestion(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(getQuizDetailsQueryKey({ courseId: variables.courseId, quizId: variables.quizId }))
    },
    onError: (e, variables) => queryOrMutationDefaultOnError(e, navigate, `/dashboard/courses/${variables.courseId}`)
  })
}
