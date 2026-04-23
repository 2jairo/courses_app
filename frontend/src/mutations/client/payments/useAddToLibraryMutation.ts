import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { ClientPaymentsService } from "@/services/client/clientPayments.service"
import type { AddToLibraryRequest } from "@/types/client/payments"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { getWatchCourseQueryKey } from "@/queries/client/courses/useWatchCourseQuery"

interface AddToLibraryRequestWrapper {
  payload: AddToLibraryRequest
  courseSlug: string
}

export const useAddToLibraryMutation = () => {
  const navigate = useNavigate()
  const queryCLient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, AddToLibraryRequestWrapper>({
    mutationFn: (data) => ClientPaymentsService.addToLibrary(data.payload),
    onSuccess: (_, variables) => {
      queryCLient.invalidateQueries(getWatchCourseQueryKey({ courseSlug: variables.courseSlug }))
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}