import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { CourseReviewsService } from "@/services/client/clientCourseReviews.service"
import type { UpdateReviewRequest, ReviewResponse } from "@/types/client/courseReviews"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { COURSE_REVIEWS_QUERY_KEY } from "@/queries/client/courseReviews/useGetReviewsQuery"

interface UpdateReviewRequestWrapper {
  payload: UpdateReviewRequest
  courseSlug: string
}

export const useUpdateReviewMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<ReviewResponse, AxiosError<LocalErrorResponse>, UpdateReviewRequestWrapper>({
    mutationFn: ({ payload }) => CourseReviewsService.updateReview(payload),
    onSuccess: (_, { courseSlug }) => {
      queryClient.invalidateQueries([COURSE_REVIEWS_QUERY_KEY, { courseSlug }])
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
