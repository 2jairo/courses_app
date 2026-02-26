import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { DashboardCoursesService } from "@/services/dashboard/dashboardCourses.service"
import type { CourseResponse, UpdateCourseRequest } from "@/types/dashboard/courses"
import type { LocalErrorResponse } from "@/types/error"
import { COURSES_QUERY_KEY } from "@/queries/dashboard/courses/useCoursesQuery"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"


export const useUpdateCourseMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<CourseResponse, AxiosError<LocalErrorResponse>, UpdateCourseRequest>({
    mutationFn: (payload) => DashboardCoursesService.updateCourse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries([COURSES_QUERY_KEY])
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate,'/dashboard/courses')
  })
}
