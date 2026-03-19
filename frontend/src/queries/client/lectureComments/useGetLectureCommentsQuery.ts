import { useNavigate } from "react-router-dom"
import { useInfiniteQuery } from "react-query"
import type { AxiosError } from "axios"

import { ClientLectureCommentsService } from "@/services/client/clientLectureComments.service"
import type { GetLectureCommentsRequest, LectureCommentResponse } from "@/types/client/lectureComments"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const LECTURE_COMMENTS_QUERY_KEY = "lecture-comments"
export const LECTURE_COMMENTS_PAGE_SIZE = 15

export const getLectureCommentsQueryKey = (q: GetLectureCommentsRequest) => {
  return [LECTURE_COMMENTS_QUERY_KEY, q] as const
}

export const useGetLectureCommentsQuery = (q: GetLectureCommentsRequest) => {
  const navigate = useNavigate()
  
  return useInfiniteQuery<LectureCommentResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getLectureCommentsQueryKey(q),
    queryFn: ({ pageParam, signal }) => ClientLectureCommentsService.getComments({
      ...q,
      page: pageParam?.page || 1,
      size: pageParam?.size || LECTURE_COMMENTS_PAGE_SIZE
    }, { signal }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < LECTURE_COMMENTS_PAGE_SIZE ? undefined : {
        page: allPages.length + 1,
        size: LECTURE_COMMENTS_PAGE_SIZE
      }
    },
    enabled: !!q.lectureSlug,
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
