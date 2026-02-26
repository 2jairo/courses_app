import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import type { DeleteCourseSectionRequest } from "@/types/dashboard/courseSections"
import { CourseSectionsService } from "@/services/dashboard/courseSections.service"
import { getCourseDetailsQueryKey } from "@/queries/dashboard/courses/useCourseDetailsQuery"

interface DeleteCourseSectionRequestWrapper extends DeleteCourseSectionRequest {
  courseId: number
}

export const useDeleteCourseSectionMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, DeleteCourseSectionRequestWrapper>({
    mutationFn: (payload) => CourseSectionsService.deleteCourseSection(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(getCourseDetailsQueryKey({ courseId: variables.courseId }))
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate, '/dashboard/courses')
  })
}
