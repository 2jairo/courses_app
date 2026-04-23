import { useNavigate } from "react-router-dom"
import { useInfiniteQuery, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { ClientSearchService } from "@/services/client/clientSearch.service"
import type { SearchCoursesRequest, SearchCoursesResponse } from "@/types/client/search"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { SearchContext } from "@/context/search/createSearchProvider"
import { useContext } from "react"

export const SEARCH_COURSES_QUERY_KEY = "search-courses"
export const SEARCH_COURSES_PAGE_SIZE = 15

export const getSearchCoursesQueryKey = (q: SearchCoursesRequest) => {
  return [SEARCH_COURSES_QUERY_KEY, q] as const
}

export const useSearchCoursesQuery = (q: SearchCoursesRequest) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { silentlyUpdateUrl } = useContext(SearchContext)
  
  return useInfiniteQuery<SearchCoursesResponse, AxiosError<LocalErrorResponse>>({
    queryKey: getSearchCoursesQueryKey(q),
    queryFn: ({ pageParam, signal }) => ClientSearchService.searchCourses({
      ...q,
      page: pageParam?.page || 1,
      size: pageParam?.size || SEARCH_COURSES_PAGE_SIZE
    }, { signal }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.courses.length < SEARCH_COURSES_PAGE_SIZE ? undefined : {
        page: allPages.length + 1,
        size: SEARCH_COURSES_PAGE_SIZE
      }
    },
    onSuccess: (data) => {
      if (q.mode === "ai" && data.pages.length === 1 && data.pages[0]?.filters) {
        const { page, size, ...restFilters } = data.pages[0].filters
        const newFilters: SearchCoursesRequest = {
          originalQ: q.q,
          ...restFilters,
          mode: 'fts',
          q: data.pages[0].filters.q || ''
        }
        
        // Populate the cache with the exact FTS request to prevent a duplicate first-page request
        queryClient.setQueryData(getSearchCoursesQueryKey(newFilters), data)
        silentlyUpdateUrl(newFilters)
      }
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
