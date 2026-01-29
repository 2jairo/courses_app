import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import type { CourseSectionResponse, UpdateCourseSectionRequest } from "@/types/dashboard/courseSections"
import { CourseSectionsService } from "@/services/courseSections.service"
import { getCourseDetailsQueryKey } from "@/queries/dashboard/courses/useCourseDetailsQuery"


interface UpdateCourseSectionRequestWrapper extends UpdateCourseSectionRequest {
  courseId: number
}

export const useUpdateCourseSectionMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<CourseSectionResponse, AxiosError<LocalErrorResponse>, UpdateCourseSectionRequestWrapper>({
    mutationFn: (payload) => CourseSectionsService.updateCourseSection(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(getCourseDetailsQueryKey({ courseId: variables.courseId }))
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate, '/dashboard/courses')
  })
}
