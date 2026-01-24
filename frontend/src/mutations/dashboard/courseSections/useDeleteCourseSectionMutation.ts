import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationDefaultOnError"
import type { DeleteCourseSectionRequest } from "@/types/courseSections"
import { CourseSectionsService } from "@/services/courseSections.service"
import { getCourseDetailsQueryKey } from "@/queries/dashboard/courses/useCourseDetailsQuery"

interface DeleteCourseSectionRequestWrapper extends DeleteCourseSectionRequest {
  courseId: number
}

export const useDeleteCourseSectionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, DeleteCourseSectionRequestWrapper>({
    mutationFn: (payload) => CourseSectionsService.deleteCourseSection(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(getCourseDetailsQueryKey({ courseId: variables.courseId }))
    },
    onError: queryOrMutationDefaultOnError
  })
}
