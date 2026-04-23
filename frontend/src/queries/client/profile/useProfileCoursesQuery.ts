import { useInfiniteQuery } from "react-query"
import type { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"

import { ClientProfileService } from "@/services/client/clientProfile.service"
import type { ProfileUserCourseResponse } from "@/types/client/profile"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const PROFILE_COURSES_QUERY_KEY = "profile_courses"
export const PROFILE_COURSES_PAGE_SIZE = 12

export const getProfileCoursesQueryKey = () => {
  return [PROFILE_COURSES_QUERY_KEY] as const
}

export const useProfileCoursesQuery = () => {
  const navigate = useNavigate()

  return useInfiniteQuery<ProfileUserCourseResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getProfileCoursesQueryKey(),
    queryFn: ({ signal }) => ClientProfileService.getUserCreatedCourses({ signal }),
    getNextPageParam: () => undefined,
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
