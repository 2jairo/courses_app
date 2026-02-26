import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import type { MoveLectureToSectionRequest } from "@/types/dashboard/lectures"
import { LecturesService } from "@/services/dashboard/lectures.service"
import { getCourseDetailsQueryKey } from "@/queries/dashboard/courses/useCourseDetailsQuery"

interface MoveLectureToSectionRequestWrapper extends MoveLectureToSectionRequest {
  courseId: number
}

export const useMoveLectureToSectionMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, MoveLectureToSectionRequestWrapper>({
    mutationFn: (payload) => LecturesService.moveLectureToSection(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(getCourseDetailsQueryKey({ courseId: variables.courseId }))
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate, '/dashboard/courses')
  })
}
