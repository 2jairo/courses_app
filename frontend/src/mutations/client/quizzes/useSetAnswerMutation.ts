import { useNavigate } from "react-router-dom"
import { useMutation } from "react-query"
import type { AxiosError } from "axios"

import { ClientQuizzesService } from "@/services/client/clientQuizzes.service"
import type { SetAnswerRequest } from "@/types/client/quizzes"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const useSetAnswerMutation = () => {
  const navigate = useNavigate()

  return useMutation<void, AxiosError<LocalErrorResponse>, SetAnswerRequest>({
    mutationFn: (data) => ClientQuizzesService.setAnswer(data),
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
