import { useNavigate } from "react-router-dom"
import { useQuery } from "react-query"
import type { AxiosError } from "axios"

import { ClientSearchService } from "@/services/client/clientSearch.service"
import type { SearchCoursesAutocompleteRequest, SearchCoursesAutocompleteResponse } from "@/types/client/search"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const SEARCH_COURSES_AUTOCOMPLETE_QUERY_KEY = "search_courses_autocomplete"

export const getSearchCoursesAutocompleteQueryKey = (data: SearchCoursesAutocompleteRequest) => {
  return [SEARCH_COURSES_AUTOCOMPLETE_QUERY_KEY, data] as const
}

export const useSearchCoursesAutocompleteQuery = (data: SearchCoursesAutocompleteRequest) => {
  const navigate = useNavigate()
  
  return useQuery<SearchCoursesAutocompleteResponse, AxiosError<LocalErrorResponse>>({
    queryKey: getSearchCoursesAutocompleteQueryKey(data),
    queryFn: ({ signal }) => ClientSearchService.searchCoursesAutocomplete(data, { signal }),
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
