import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationDefaultOnError"
import type { CourseSectionResponse, CreateCourseSectionRequest } from "@/types/courseSections"
import { CourseSectionsService } from "@/services/courseSections.service"
import { getCourseDetailsQueryKey } from "@/queries/dashboard/courses/useCourseDetailsQuery"

export const useCreateCourseSectionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<CourseSectionResponse, AxiosError<LocalErrorResponse>, CreateCourseSectionRequest>({
    mutationFn: (payload) => CourseSectionsService.createCourseSection(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(getCourseDetailsQueryKey({ courseId: variables.courseId }))
    },
    onError: queryOrMutationDefaultOnError
  })
}
