import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import type { UpdateLectureRequest, LectureResponse } from "@/types/dashboard/lectures"
import { LecturesService } from "@/services/lectures.service"
import { getCourseDetailsQueryKey } from "@/queries/dashboard/courses/useCourseDetailsQuery"
import { getLectureQueryKey } from "@/queries/dashboard/lectures/useLectureQuery"

type UpdateLectureRequestWrapper = {
  payload: UpdateLectureRequest
  courseId: number
}

export const useUpdateLectureMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<LectureResponse, AxiosError<LocalErrorResponse>, UpdateLectureRequestWrapper>({
    mutationFn: (payload) => LecturesService.updateLecture(payload.payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(getCourseDetailsQueryKey({ courseId: variables.courseId }))
      queryClient.invalidateQueries(getLectureQueryKey({ lectureId: variables.payload.lectureId }))
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate)
  })
}
