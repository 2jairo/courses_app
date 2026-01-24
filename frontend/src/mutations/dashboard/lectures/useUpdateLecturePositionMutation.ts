import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationDefaultOnError"
import type { UpdateLecturePositionRequest } from "@/types/lectures"
import { LecturesService } from "@/services/lectures.service"
import { getCourseDetailsQueryKey } from "@/queries/dashboard/courses/useCourseDetailsQuery"

interface UpdateLecturePositionRequestWrapper extends UpdateLecturePositionRequest {
  courseId: number
}

export const useUpdateLecturePositionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, UpdateLecturePositionRequestWrapper>({
    mutationFn: (payload) => LecturesService.updateLecturePosition(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(getCourseDetailsQueryKey({ courseId: variables.courseId }))
    },
    onError: queryOrMutationDefaultOnError
  })
}
