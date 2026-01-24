import { useQuery } from "react-query"
import type { AxiosError } from "axios"

import { CoursesService } from "@/services/courses.service"
import type { CourseResponseExtended, GetDashboardCourseDetailsRequest } from "@/types/courses"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationDefaultOnError"
import { COURSES_QUERY_KEY } from "./useCoursesQuery"

export const COURSE_DETAILS_QUERY_KEY = "course_details"

export const getCourseDetailsQueryKey = (data: GetDashboardCourseDetailsRequest) => {
  return [COURSE_DETAILS_QUERY_KEY, COURSES_QUERY_KEY, data] as const
}

export const useCourseDetailsQuery = (data: GetDashboardCourseDetailsRequest) => {
  return useQuery<CourseResponseExtended, AxiosError<LocalErrorResponse>>({
    queryKey: getCourseDetailsQueryKey(data),
    queryFn: () => CoursesService.getDashboardCourseDetails(data),
    onError: queryOrMutationDefaultOnError,
    enabled: data.courseId !== null
  })
}
