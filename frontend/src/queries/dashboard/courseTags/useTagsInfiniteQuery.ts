import { useInfiniteQuery } from 'react-query'
import type { AxiosError } from 'axios'
import type { GetTagsRequest, TagResponse } from '@/types/dashboard/courseTag'
import { DashboardCourseTagsService } from '@/services/dashboard/courseTags.service'
import { queryOrMutationDefaultOnError } from '@/lib/queryOrMutationOnError'
import { useNavigate } from 'react-router-dom'
import type { LocalErrorResponse } from '@/types/error'
import { MIN_COURSE_TAG_LENGTH } from '@/types/common/tags'

export const COURSE_TAGS_QUERY_KEY = 'dashboard-course-tags'
export const COURSE_TAGS_PAGE_SIZE = 15

export const getTagsQueryKey = (query: GetTagsRequest) => {
  return [COURSE_TAGS_QUERY_KEY, query] as const
}

export const useTagsInfiniteQuery = (q: GetTagsRequest) => {
  const navigate = useNavigate()

  return useInfiniteQuery<TagResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getTagsQueryKey(q),
    queryFn: ({ pageParam, signal }) => DashboardCourseTagsService.getTags({
      ...q,
      page: pageParam?.page || 1,
      size: pageParam?.size || COURSE_TAGS_PAGE_SIZE
    }, { signal }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < COURSE_TAGS_PAGE_SIZE ? undefined : {
        page: allPages.length + 1,
        size: COURSE_TAGS_PAGE_SIZE
      }
    },
    enabled: (q.q?.length || 0) >= MIN_COURSE_TAG_LENGTH,
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
