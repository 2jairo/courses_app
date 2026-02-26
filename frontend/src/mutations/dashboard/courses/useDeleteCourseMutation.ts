import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { DashboardCoursesService } from "@/services/dashboard/dashboardCourses.service"
import type { LocalErrorResponse } from "@/types/error"
import { COURSES_QUERY_KEY } from "@/queries/dashboard/courses/useCoursesQuery"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import type { DeleteCourseRequest } from "@/types/dashboard/courses"


export const useDeleteCourseMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, DeleteCourseRequest>({
    mutationFn: (data) => DashboardCoursesService.deleteCourse(data),
    onSuccess: () => {
      navigate('/dashboard/courses') //TODO: no 403 error
      queryClient.invalidateQueries(COURSES_QUERY_KEY)
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate)
  })
}
