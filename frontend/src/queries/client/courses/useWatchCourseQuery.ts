import { useQuery } from "react-query"
import type { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"

import { ClientCoursesService } from "@/services/client/clientCourses.service"
import type { WatchCourseRequest, WatchCourseResponse } from "@/types/client/courses"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const WATCH_COURSE_QUERY_KEY = "watch_course"

export const getWatchCourseQueryKey = (data: WatchCourseRequest) => {
	return [WATCH_COURSE_QUERY_KEY, data] as const
}

export const useWatchCourseQuery = (data: WatchCourseRequest) => {
	const navigate = useNavigate()

	return useQuery<WatchCourseResponse, AxiosError<LocalErrorResponse>>({
		queryKey: getWatchCourseQueryKey(data),
		queryFn: ({ signal }) => ClientCoursesService.watchCourse(data, { signal }),
		onError: (e) => queryOrMutationDefaultOnError(e, navigate),
		enabled: !!data.courseSlug,
	})
}
