import { useNavigate } from "react-router-dom"
import { useQuery } from "react-query"
import type { AxiosError } from "axios"

import { ClientSearchService } from "@/services/client/clientSearch.service"
import type { SearchCoursesCourseResponse } from "@/types/client/search"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const TOP_COURSES_QUERY_KEY = "top_courses"

export const getTopCoursesQueryKey = () => {
  return [TOP_COURSES_QUERY_KEY] as const
}

export const useTopCoursesQuery = () => {
  const navigate = useNavigate()

  return useQuery<SearchCoursesCourseResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getTopCoursesQueryKey(),
    queryFn: ({ signal }) => ClientSearchService.getTopCourses({ signal }),
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
