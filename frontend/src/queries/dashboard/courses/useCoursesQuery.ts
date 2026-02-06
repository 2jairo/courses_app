import { useNavigate } from "react-router-dom"
import { useQuery } from "react-query"
import type { AxiosError } from "axios"

import { DashboardCoursesService } from "@/services/dashboardCourses.service"
import type { CourseResponse, GetDashboardCoursesRequest } from "@/types/dashboard/courses"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const COURSES_QUERY_KEY = "courses"

export const getDashboardCoursesQueryKey = (q: GetDashboardCoursesRequest) => {
  return [COURSES_QUERY_KEY, q] as const
}


export const useDashboardCoursesQuery = (q: GetDashboardCoursesRequest) => {
  const navigate = useNavigate()
  
  return useQuery<CourseResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getDashboardCoursesQueryKey(q),
    queryFn: ({ signal }) => DashboardCoursesService.getDashboardCourses(q, { signal }),
    keepPreviousData: true,
    onError: (e) => queryOrMutationDefaultOnError(e, navigate)
  })
}
