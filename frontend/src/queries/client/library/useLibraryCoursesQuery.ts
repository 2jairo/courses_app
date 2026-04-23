import { useInfiniteQuery } from "react-query"
import type { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"

import { ClientProfileService } from "@/services/client/clientProfile.service"
import type { ProfileUserCourseResponse } from "@/types/client/profile"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const LIBRARY_COURSES_QUERY_KEY = "library_courses"
export const LIBRARY_COURSES_PAGE_SIZE = 12

export const getLibraryCoursesQueryKey = () => {
  return [LIBRARY_COURSES_QUERY_KEY] as const
}

export const useLibraryCoursesQuery = () => {
  const navigate = useNavigate()

  return useInfiniteQuery<ProfileUserCourseResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getLibraryCoursesQueryKey(),
    queryFn: ({ pageParam, signal }) =>
      ClientProfileService.getUserPurchasedCourses(
        {
          page: pageParam?.page || 1,
          size: pageParam?.size || LIBRARY_COURSES_PAGE_SIZE,
        },
        { signal }
      ),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < LIBRARY_COURSES_PAGE_SIZE
        ? undefined
        : {
            page: allPages.length + 1,
            size: LIBRARY_COURSES_PAGE_SIZE,
          }
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
