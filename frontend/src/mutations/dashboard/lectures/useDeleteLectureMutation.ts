import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationDefaultOnError"
import type { DeleteLectureRequest } from "@/types/lectures"
import { LecturesService } from "@/services/lectures.service"
import { getCourseDetailsQueryKey } from "@/queries/dashboard/courses/useCourseDetailsQuery"

interface DeleteLectureRequestWrapper extends DeleteLectureRequest {
  courseId: number
}

export const useDeleteLectureMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, DeleteLectureRequestWrapper>({
    mutationFn: (payload) => LecturesService.deleteLecture(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(getCourseDetailsQueryKey({ courseId: variables.courseId }))
    },
    onError: queryOrMutationDefaultOnError
  })
}
