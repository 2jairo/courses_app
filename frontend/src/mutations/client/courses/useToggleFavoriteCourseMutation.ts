import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { ClientFavoriteCoursesService } from "@/services/client/clientFavoriteCourses.service"
import type { ToggleFavoriteCourseRequest } from "@/types/client/favCourses"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { getWatchCourseQueryKey } from "@/queries/client/courses/useWatchCourseQuery"

interface ToggleFavoriteCourseMutationData {
  payload: ToggleFavoriteCourseRequest
  courseSlug: string
}

export const useToggleFavoriteCourseMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, ToggleFavoriteCourseMutationData>({
    mutationFn: (data) => ClientFavoriteCoursesService.toggleFavoriteCourse(data.payload),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries(getWatchCourseQueryKey({ courseSlug: data.courseSlug }))
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
