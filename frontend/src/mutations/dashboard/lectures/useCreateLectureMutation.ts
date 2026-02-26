import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import type { CreateLectureRequest, LectureResponse } from "@/types/dashboard/lectures"
import { LecturesService } from "@/services/dashboard/lectures.service"
import { getCourseDetailsQueryKey } from "@/queries/dashboard/courses/useCourseDetailsQuery"

interface CreateLectureRequestWrapper {
  payload: CreateLectureRequest
  courseId: number
}

export const useCreateLectureMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<LectureResponse, AxiosError<LocalErrorResponse>, CreateLectureRequestWrapper>({
    mutationFn: ({ payload }) => LecturesService.createLecture(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(getCourseDetailsQueryKey({ courseId: variables.courseId }))
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate, '/dashboard/courses')
  })
}
