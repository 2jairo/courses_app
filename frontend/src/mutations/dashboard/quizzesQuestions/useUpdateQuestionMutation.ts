import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import type { UpdateQuestionRequest, QuizQuestionResponse } from "@/types/dashboard/quizzesQuestions"
import { QuizzesQuestionsService } from "@/services/dashboard/quizzesQuestions.service"
import { getQuizDetailsQueryKey } from "@/queries/dashboard/quizzes/useQuizDetailsQuery"

interface UpdateQuestionRequestWrapper {
  payload: UpdateQuestionRequest
  courseId: number
  quizId: number
}

export const useUpdateQuestionMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<QuizQuestionResponse, AxiosError<LocalErrorResponse>, UpdateQuestionRequestWrapper>({
    mutationFn: ({ payload }) => QuizzesQuestionsService.updateQuestion(payload),
    onSuccess: (_, variables) => {
      // Invalidate quiz details to refetch questions
      queryClient.invalidateQueries(getQuizDetailsQueryKey({ courseId: variables.courseId, quizId: variables.quizId }))
    },
    onError: (e, variables) => queryOrMutationDefaultOnError(e, navigate, `/dashboard/courses/${variables.courseId}`)
  })
}
