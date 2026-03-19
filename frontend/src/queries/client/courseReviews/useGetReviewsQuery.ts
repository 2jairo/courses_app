import { useNavigate } from "react-router-dom"
import { useInfiniteQuery } from "react-query"
import type { AxiosError } from "axios"

import { CourseReviewsService } from "@/services/client/clientCourseReviews.service"
import type { GetReviewsRequest } from "@/types/client/courseReviews"
import type { ReviewResponse } from "@/types/client/courseReviews"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const COURSE_REVIEWS_QUERY_KEY = "course_reviews"
export const COURSE_REVIEWS_PAGE_SIZE = 10

export const getCourseReviewsQueryKey = (data: GetReviewsRequest) => {
  return [COURSE_REVIEWS_QUERY_KEY, data] as const
}

export const useGetReviewsQuery = (
  data: GetReviewsRequest,
  options?: { enabled?: boolean }
) => {
  const navigate = useNavigate()

  return useInfiniteQuery<ReviewResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getCourseReviewsQueryKey(data),
    queryFn: ({ pageParam, signal }) => CourseReviewsService.getReviews({
      ...data,
      page: pageParam?.page || 1,
      size: pageParam?.size || COURSE_REVIEWS_PAGE_SIZE,
    }, { signal }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < COURSE_REVIEWS_PAGE_SIZE ? undefined : {
        page: allPages.length + 1,
        size: COURSE_REVIEWS_PAGE_SIZE,
      }
    },
    enabled: !!data.courseSlug && (options?.enabled ?? true),
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
