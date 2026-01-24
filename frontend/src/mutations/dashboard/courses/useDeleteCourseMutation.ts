import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { CoursesService } from "@/services/courses.service"
import type { LocalErrorResponse } from "@/types/error"
import { COURSES_QUERY_KEY } from "@/queries/dashboard/courses/useCoursesQuery"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationDefaultOnError"
import type { DeleteCourseRequest } from "@/types/courses"


export const useDeleteCourseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, DeleteCourseRequest>({
    mutationFn: (data) => CoursesService.deleteCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries(COURSES_QUERY_KEY)
    },
    onError: queryOrMutationDefaultOnError
  })
}
