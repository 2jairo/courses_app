import { useQuery } from "react-query"
import type { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"

import { ClientCoursesService } from "@/services/client/clientCourses.service"
import type { WatchCourseRequest, WatchCourseResponse } from "@/types/client/courses"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { ClientAnalyticsService } from "@/services/client/clientAnalytics.service"
import type { AnalyticsViewSource } from "@/types/common/analytics"

export const WATCH_COURSE_QUERY_KEY = "watch_course"

interface WatchCourseRequestWrapper {
	payload: WatchCourseRequest
	viewSource: AnalyticsViewSource
}

export const getWatchCourseQueryKey = (data: WatchCourseRequest) => {
	return [WATCH_COURSE_QUERY_KEY, data] as const
}

export const useWatchCourseQuery = (data: WatchCourseRequestWrapper) => {
	const navigate = useNavigate()

	return useQuery<WatchCourseResponse, AxiosError<LocalErrorResponse>>({
		queryKey: getWatchCourseQueryKey(data.payload),
		queryFn: ({ signal }) => ClientCoursesService.watchCourse(data.payload, { signal }),
		onError: (e) => queryOrMutationDefaultOnError(e, navigate),
		onSuccess: (course) => {
			ClientAnalyticsService.trackCourseView({ courseId: course.id, viewSource: data.viewSource })
		},
		enabled: !!data.payload.courseSlug,
	})
}
