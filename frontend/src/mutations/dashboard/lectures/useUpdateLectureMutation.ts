import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import type { UpdateLectureRequest, LectureResponse } from "@/types/dashboard/lectures"
import type { CourseResponseExtended } from "@/types/dashboard/courses"
import { LecturesService } from "@/services/dashboard/lectures.service"
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
    onSuccess: (data, variables) => {
      queryClient.setQueryData<CourseResponseExtended>(
        getCourseDetailsQueryKey({ courseId: variables.courseId }),
        (old) => {
          if (!old) return old!
          return {
            ...old,
            sections: old.sections.map((section) => ({
              ...section,
              lectures: section.lectures.map((lecture) =>
                lecture.id === variables.payload.lectureId
                  ? data
                  : lecture
              ),
            })),
          }
        }
      )
      queryClient.setQueryData<LectureResponse>(
        getLectureQueryKey({ lectureId: variables.payload.lectureId }),
        () => data
      )
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate)
  })
}
