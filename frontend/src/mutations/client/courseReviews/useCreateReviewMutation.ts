import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { CourseReviewsService } from "@/services/client/clientCourseReviews.service"
import type { CreateReviewRequest, ReviewResponse } from "@/types/client/courseReviews"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { COURSE_REVIEWS_QUERY_KEY } from "@/queries/client/courseReviews/useGetReviewsQuery"

export const useCreateReviewMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<ReviewResponse, AxiosError<LocalErrorResponse>, CreateReviewRequest>({
    mutationFn: (data) => CourseReviewsService.createReview(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries([COURSE_REVIEWS_QUERY_KEY, { courseSlug: data.courseSlug }])
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
