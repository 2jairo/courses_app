import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import type { UpdateCourseSectionPositionRequest } from "@/types/dashboard/courseSections"
import { CourseSectionsService } from "@/services/dashboard/courseSections.service"
import { getCourseDetailsQueryKey } from "@/queries/dashboard/courses/useCourseDetailsQuery"

export const useUpdateCourseSectionPositionMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, UpdateCourseSectionPositionRequest>({
    mutationFn: (payload) => CourseSectionsService.updateCourseSectionPosition(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(getCourseDetailsQueryKey({ courseId: variables.courseId }))
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate, '/dashboard/courses')
  })
}
