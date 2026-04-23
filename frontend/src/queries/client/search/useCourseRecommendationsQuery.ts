import { useNavigate } from "react-router-dom"
import { useInfiniteQuery } from "react-query"
import type { AxiosError } from "axios"

import { ClientSearchService } from "@/services/client/clientSearch.service"
import type { GetCourseRecommendationsRequest, SearchCoursesCourseResponse } from "@/types/client/search"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const COURSE_RECOMMENDATIONS_QUERY_KEY = "course_recommendations"
export const COURSE_RECOMMENDATIONS_PAGE_SIZE = 15

export const getCourseRecommendationsQueryKey = (q: GetCourseRecommendationsRequest) => {
  return [COURSE_RECOMMENDATIONS_QUERY_KEY, q] as const
}

export const useCourseRecommendationsQuery = (q: GetCourseRecommendationsRequest, options?: { enabled?: boolean }) => {
  const navigate = useNavigate()
  
  return useInfiniteQuery<SearchCoursesCourseResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getCourseRecommendationsQueryKey(q),
    queryFn: ({ pageParam, signal }) => ClientSearchService.getCourseRecommendations({
      ...q,
      page: pageParam?.page || 1,
      size: pageParam?.size || COURSE_RECOMMENDATIONS_PAGE_SIZE
    }, { signal }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < COURSE_RECOMMENDATIONS_PAGE_SIZE ? undefined : {
        page: allPages.length + 1,
        size: COURSE_RECOMMENDATIONS_PAGE_SIZE
      }
    },
    enabled: !!q.courseId && (options?.enabled ?? true),
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
