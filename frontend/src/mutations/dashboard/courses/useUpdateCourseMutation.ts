import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { CoursesService } from "@/services/courses.service"
import type { CourseResponse, UpdateCourseRequest } from "@/types/courses"
import type { LocalErrorResponse } from "@/types/error"
import { COURSES_QUERY_KEY } from "@/queries/dashboard/courses/useCoursesQuery"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationDefaultOnError"


export const useUpdateCourseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<CourseResponse, AxiosError<LocalErrorResponse>, UpdateCourseRequest>({
    mutationFn: (payload) => CoursesService.updateCourse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(COURSES_QUERY_KEY)
    },
    onError: queryOrMutationDefaultOnError
  })
}
