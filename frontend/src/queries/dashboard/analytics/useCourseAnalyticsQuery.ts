import { useQuery } from "react-query"
import type { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"

import { DashboardAnalyticsService } from "@/services/dashboard/dashboardAnalytics.service"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import type { GetCourseAnalyticsCompactResponse, GetCourseAnalyticsRequest } from "@/types/dashboard/analytics"
import type { LocalErrorResponse } from "@/types/error"

export const COURSE_ANALYTICS_QUERY_KEY = "course_analytics"

export const getCourseAnalyticsQueryKey = (data: GetCourseAnalyticsRequest) => {
  return [COURSE_ANALYTICS_QUERY_KEY, data] as const
}

export const useCourseAnalyticsQuery = (data: GetCourseAnalyticsRequest) => {
  const navigate = useNavigate()

  return useQuery<GetCourseAnalyticsCompactResponse, AxiosError<LocalErrorResponse>>({
    queryKey: getCourseAnalyticsQueryKey(data),
    queryFn: ({ signal }) => DashboardAnalyticsService.getCourseAnalytics(data, { signal }),
    enabled: data.courseId !== null,
    onError: (e) => queryOrMutationDefaultOnError(e, navigate, "/dashboard/courses")
  })
}
