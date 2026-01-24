import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationDefaultOnError"
import type { MoveLectureToSectionRequest } from "@/types/lectures"
import { LecturesService } from "@/services/lectures.service"
import { getCourseDetailsQueryKey } from "@/queries/dashboard/courses/useCourseDetailsQuery"

interface MoveLectureToSectionRequestWrapper extends MoveLectureToSectionRequest {
  courseId: number
}

export const useMoveLectureToSectionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, MoveLectureToSectionRequestWrapper>({
    mutationFn: (payload) => LecturesService.moveLectureToSection(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(getCourseDetailsQueryKey({ courseId: variables.courseId }))
    },
    onError: queryOrMutationDefaultOnError
  })
}
