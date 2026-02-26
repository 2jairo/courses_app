import { useQuery } from "react-query"
import type { AxiosError } from "axios"

import { DashboardCoursesService } from "@/services/dashboard/dashboardCourses.service"
import type { CourseResponseExtended, GetDashboardCourseDetailsRequest } from "@/types/dashboard/courses"
import { type LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { COURSES_QUERY_KEY } from "./useCoursesQuery"
import { useNavigate } from "react-router-dom"

export const COURSE_DETAILS_QUERY_KEY = "course_details"

export const getCourseDetailsQueryKey = (data: GetDashboardCourseDetailsRequest) => {
  return [COURSES_QUERY_KEY, COURSE_DETAILS_QUERY_KEY, data] as const
}

export const useCourseDetailsQuery = (data: GetDashboardCourseDetailsRequest) => {
  const navigate = useNavigate()

  return useQuery<CourseResponseExtended, AxiosError<LocalErrorResponse>>({
    queryKey: getCourseDetailsQueryKey(data),
    queryFn: ({ signal }) => DashboardCoursesService.getDashboardCourseDetails(data, { signal }),
    onError: (e) => queryOrMutationDefaultOnError(e, navigate, '/dashboard/courses'),
    enabled: data.courseId !== null
  })
}
