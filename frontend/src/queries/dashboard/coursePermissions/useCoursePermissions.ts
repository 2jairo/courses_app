import { useQuery } from "react-query"
import type { AxiosError } from "axios"

import type { LocalErrorResponse } from "@/types/error"
import { CoursePermissionsService } from "@/services/coursePermissions.service"
import type { GetCourseMembersRequest, GetCourseMembersResponse } from "@/types/coursePermissions"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationDefaultOnError"

export const COURSE_PERMISSIONS_QUERY_KEY = "course_permissions"

export const getDashboardCoursePermissionsQueryKey = (data: GetCourseMembersRequest) => {
  return [COURSE_PERMISSIONS_QUERY_KEY, data] as const
}

export const useDashboardCoursePermissionsQuery = (data: GetCourseMembersRequest) => {
  return useQuery<GetCourseMembersResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getDashboardCoursePermissionsQueryKey(data),
    queryFn: () => CoursePermissionsService.getCourseMembers(data),
    keepPreviousData: true,
    onError: queryOrMutationDefaultOnError,
    enabled: data.courseId !== null
  })
}
