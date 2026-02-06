import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { ClientCoursesService } from "@/services/client/clientCourses.service"
import type { MarkLectureAsSeenRequest } from "@/types/client/courses"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { getPlayLectureQueryKey } from "@/queries/client/lectures/usePlayLectureQuery"
import { getWatchCourseQueryKey } from "@/queries/client/courses/useWatchCourseQuery"


interface MarkLectureAsSeenRequestWrapper {
  payload: MarkLectureAsSeenRequest
  lectureSlug: string
  courseSlug: string
}

export const useMarkLectureAsSeenMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, MarkLectureAsSeenRequestWrapper>({
    mutationFn: (payload) => ClientCoursesService.markLectureAsSeen(payload.payload),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries(getPlayLectureQueryKey({ lectureSlug: data.lectureSlug }))
      queryClient.invalidateQueries(getWatchCourseQueryKey({ courseSlug: data.courseSlug }))
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate)
  })
}
