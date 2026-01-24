import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationDefaultOnError"
import type { UpdateLectureRequest, LectureResponse } from "@/types/lectures"
import { LecturesService } from "@/services/lectures.service"
import { getCourseDetailsQueryKey } from "@/queries/dashboard/courses/useCourseDetailsQuery"
import { getLectureQueryKey } from "@/queries/dashboard/lectures/useLectureQuery"

type UpdateLectureRequestWrapper = UpdateLectureRequest & {
  courseId: number
}

export const useUpdateLectureMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<LectureResponse, AxiosError<LocalErrorResponse>, UpdateLectureRequestWrapper>({
    mutationFn: (payload) => LecturesService.updateLecture(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(getCourseDetailsQueryKey({ courseId: variables.courseId }))
      queryClient.invalidateQueries(getLectureQueryKey({ lectureId: variables.lectureId }))
    },
    onError: queryOrMutationDefaultOnError
  })
}
