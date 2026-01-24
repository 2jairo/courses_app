import { useQuery } from "react-query"
import type { AxiosError } from "axios"

import { CoursesService } from "@/services/courses.service"
import type { CourseResponse, GetDashboardCoursesRequest } from "@/types/courses"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationDefaultOnError"

export const COURSES_QUERY_KEY = "courses"

export const getDashboardCoursesQueryKey = (q: GetDashboardCoursesRequest) => {
  return [COURSES_QUERY_KEY, q] as const
}


export const useDashboardCoursesQuery = (q: GetDashboardCoursesRequest) => {
  return useQuery<CourseResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getDashboardCoursesQueryKey(q),
    queryFn: () => CoursesService.getDashboardCourses(q),
    keepPreviousData: true,
    onError: queryOrMutationDefaultOnError
  })
}
