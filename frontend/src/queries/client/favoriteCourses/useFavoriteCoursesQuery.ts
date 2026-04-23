import { useNavigate } from "react-router-dom"
import { useInfiniteQuery } from "react-query"
import type { AxiosError } from "axios"

import { ClientFavoriteCoursesService } from "@/services/client/clientFavoriteCourses.service"
import type { SearchCoursesCourseResponse } from "@/types/client/search"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const FAVORITE_COURSES_QUERY_KEY = "favorite_courses"
export const FAVORITE_COURSES_PAGE_SIZE = 12

export const getFavoriteCoursesQueryKey = () => {
  return [FAVORITE_COURSES_QUERY_KEY] as const
}

export const useFavoriteCoursesQuery = () => {
  const navigate = useNavigate()

  return useInfiniteQuery<SearchCoursesCourseResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getFavoriteCoursesQueryKey(),
    queryFn: ({ pageParam, signal }) =>
      ClientFavoriteCoursesService.getFavoriteCourses(
        {
          page: pageParam?.page || 1,
          size: pageParam?.size || FAVORITE_COURSES_PAGE_SIZE,
        },
        { signal }
      ),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < FAVORITE_COURSES_PAGE_SIZE
        ? undefined
        : {
            page: allPages.length + 1,
            size: FAVORITE_COURSES_PAGE_SIZE,
          }
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
