import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { ClientCoursesService } from "@/services/client/clientCourses.service"
import type { ResetCourseProgressRequest } from "@/types/client/courses"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { getWatchCourseQueryKey } from "@/queries/client/courses/useWatchCourseQuery"
import { PLAY_LECTURE_QUERY_KEY } from "@/queries/client/lectures/usePlayLectureQuery"


interface ResetCourseProgressRequestWrapper {
  payload: ResetCourseProgressRequest
  courseSlug: string
}

export const useResetCourseProgressMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, ResetCourseProgressRequestWrapper>({
    mutationFn: (payload) => ClientCoursesService.resetCourseProgress(payload.payload),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries(PLAY_LECTURE_QUERY_KEY)
      queryClient.invalidateQueries(getWatchCourseQueryKey({ courseSlug: data.courseSlug }))

    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate)
  })
}
